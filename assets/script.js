// ============================================
// AHP Football Ranking - Enhanced JavaScript
// ============================================

// --- CONSTANTS ---
const RI = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

const CLUB_LOGOS = {
  Barcelona:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23004D98'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='%23EDBB00'%3EB%3C/text%3E%3C/svg%3E",
  "Manchester City":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%236CABDD'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3EMC%3C/text%3E%3C/svg%3E",
  "Bayern Munich":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23DC052D'/%3E%3Ctext x='50' y='60' font-size='35' text-anchor='middle' fill='white'%3EBM%3C/text%3E%3C/svg%3E",
  Liverpool:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23C8102E'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3EL%3C/text%3E%3C/svg%3E",
};

// --- GLOBAL VARIABLES ---
let myChart = null;
let calculationHistory = [];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", function () {
  loadHistoryFromStorage();
  updateHistoryDisplay();
  updateHistoryBadge();
});

// --- EVENT LISTENERS ---
document.getElementById("buildBtn").addEventListener("click", buildMatrices);
document.getElementById("computeBtn").addEventListener("click", computeAHP);
document.getElementById("btnExample").addEventListener("click", fillExample);
document.getElementById("btnReset").addEventListener("click", () => {
  if (confirm("Reset aplikasi? Data yang belum disimpan akan hilang.")) {
    location.reload();
  }
});
document.getElementById("btnHistory").addEventListener("click", toggleHistory);
document
  .getElementById("btnClearHistory")
  .addEventListener("click", clearHistory);
document
  .getElementById("btnExportHistory")
  .addEventListener("click", exportHistory);

// ============================================
// HISTORY MANAGEMENT FUNCTIONS
// ============================================

function loadHistoryFromStorage() {
  try {
    const stored = localStorage.getItem("ahpHistory");
    if (stored) {
      calculationHistory = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading history:", e);
    calculationHistory = [];
  }
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem("ahpHistory", JSON.stringify(calculationHistory));
    updateHistoryBadge();
  } catch (e) {
    console.error("Error saving history:", e);
  }
}

function updateHistoryBadge() {
  const badge = document.getElementById("historyBadge");
  const count = calculationHistory.length;
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("d-none");
  } else {
    badge.classList.add("d-none");
  }
}

function addToHistory(data) {
  const historyItem = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    criteria: data.criteria,
    alternatives: data.alternatives,
    results: data.results,
    critWeights: data.critWeights,
    isConsistent: data.isConsistent,
  };

  calculationHistory.unshift(historyItem);

  if (calculationHistory.length > 20) {
    calculationHistory = calculationHistory.slice(0, 20);
  }

  saveHistoryToStorage();
  updateHistoryDisplay();
  showNotification("✅ Hasil tersimpan ke riwayat!");
}

function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");
  const emptyState = document.getElementById("emptyHistory");

  if (calculationHistory.length === 0) {
    emptyState.classList.remove("d-none");
    historyList.innerHTML = "";
    return;
  }

  emptyState.classList.add("d-none");
  historyList.innerHTML = "";

  calculationHistory.forEach((item, index) => {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const consistencyBadge = item.isConsistent
      ? '<span class="badge bg-success">✓ Konsisten</span>'
      : '<span class="badge bg-danger">✗ Tidak Konsisten</span>';

    const topResult = item.results[0];
    const scorePercent = (topResult.score * 100).toFixed(2);

    const historyCard = document.createElement("div");
    historyCard.className = "history-item";
    historyCard.innerHTML = `
      <div class="history-header">
        <div>
          <span class="history-number">#${index + 1}</span>
          <span class="history-date">${dateStr}</span>
        </div>
        <div>
          ${consistencyBadge}
        </div>
      </div>
      <div class="history-body">
        <div class="mb-2">
          <strong>🏆 Pemenang:</strong> 
          <span class="text-info">${topResult.name}</span>
          <span class="badge bg-info ms-2">${scorePercent}%</span>
        </div>
        <div class="small text-muted mb-1">
          <strong>📊 Kriteria (${item.criteria.length}):</strong><br>
          ${item.criteria
            .map(
              (c) => `<span class="badge bg-secondary me-1 mb-1">${c}</span>`
            )
            .join("")}
        </div>
        <div class="small text-muted mb-2">
          <strong>⚽ Alternatif (${item.alternatives.length}):</strong><br>
          ${item.alternatives
            .map((a) => `<span class="badge bg-dark me-1 mb-1">${a}</span>`)
            .join("")}
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-info flex-fill" onclick="loadHistoryItem(${
            item.id
          })">
            📂 Muat
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryItem(${
            item.id
          })" title="Hapus">
            🗑️
          </button>
        </div>
      </div>
    `;
    historyList.appendChild(historyCard);
  });
}

function toggleHistory() {
  const historyPanel = document.getElementById("historyPanel");
  const isHidden = historyPanel.classList.contains("d-none");

  if (isHidden) {
    historyPanel.classList.remove("d-none");
    const overlay = document.createElement("div");
    overlay.id = "historyOverlay";
    overlay.className = "history-overlay";
    overlay.onclick = toggleHistory;
    document.body.appendChild(overlay);
  } else {
    historyPanel.classList.add("d-none");
    const overlay = document.getElementById("historyOverlay");
    if (overlay) overlay.remove();
  }
}

function clearHistory() {
  if (
    confirm(
      "⚠️ Yakin ingin menghapus SEMUA riwayat?\n\nTindakan ini tidak dapat dibatalkan!"
    )
  ) {
    calculationHistory = [];
    saveHistoryToStorage();
    updateHistoryDisplay();
    showNotification("🗑️ Semua riwayat dihapus");
  }
}

function deleteHistoryItem(id) {
  if (confirm("Hapus item riwayat ini?")) {
    calculationHistory = calculationHistory.filter((item) => item.id !== id);
    saveHistoryToStorage();
    updateHistoryDisplay();
    showNotification("🗑️ Riwayat dihapus");
  }
}

function loadHistoryItem(id) {
  const item = calculationHistory.find((h) => h.id === id);
  if (!item) return;

  updateSteps(3);

  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = `
    <div class="alert alert-info fade-in">
      <strong>📂 Memuat dari Riwayat</strong><br>
      <small>Tanggal: ${new Date(item.timestamp).toLocaleString(
        "id-ID"
      )}</small>
      ${
        item.isConsistent
          ? '<div class="mt-2"><span class="badge bg-success">✓ Hasil Konsisten</span></div>'
          : '<div class="mt-2"><span class="badge bg-danger">✗ Hasil Tidak Konsisten</span></div>'
      }
    </div>
  `;

  if (item.critWeights) {
    summaryDiv.innerHTML += `
      <div class="card p-4 mb-4 fade-in">
        <h5 class="text-info mb-3">📊 Bobot Kriteria</h5>
        <div class="table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Kriteria</th>
                <th class="text-end">Bobot</th>
                <th class="text-end">Persentase</th>
              </tr>
            </thead>
            <tbody>
              ${item.criteria
                .map(
                  (c, i) => `
                <tr>
                  <td><strong>${c}</strong></td>
                  <td class="text-end">${item.critWeights[i].toFixed(4)}</td>
                  <td class="text-end">
                    <span class="badge bg-info">${(
                      item.critWeights[i] * 100
                    ).toFixed(2)}%</span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  summaryDiv.innerHTML += `
    <div class="card p-4 fade-in">
      <h3 class="text-info mb-4">🏆 Hasil Akhir Peringkat</h3>
      <ul class="list-group list-group-flush">
  `;

  item.results.forEach((res, index) => {
    const logoSrc =
      CLUB_LOGOS[res.name] ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2394a3b8'/%3E%3C/svg%3E";
    const medals = ["🥇", "🥈", "🥉"];
    const medal = medals[index] || "🏅";
    const scorePercent = (res.score * 100).toFixed(2);

    summaryDiv.innerHTML += `
      <li class="list-group-item">
        <div>
          <span class="fw-bold fs-4 me-3">${medal}</span>
          <img src="${logoSrc}" alt="${res.name}" class="club-logo">
          <span class="fs-5">${res.name}</span>
        </div>
        <span class="badge bg-info fs-6">${scorePercent}%</span>
      </li>
    `;
  });

  summaryDiv.innerHTML += `</ul></div>`;

  drawChart(item.results);

  document.getElementById("resultArea").classList.remove("d-none");
  document.getElementById("resultArea").scrollIntoView({ behavior: "smooth" });

  toggleHistory();
  showNotification("📂 Riwayat berhasil dimuat");
}

function exportHistory() {
  if (calculationHistory.length === 0) {
    alert("Tidak ada riwayat untuk diekspor");
    return;
  }

  const dataStr = JSON.stringify(calculationHistory, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ahp-history-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  showNotification("💾 Riwayat berhasil diekspor!");
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 100);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// UI BUILDING FUNCTIONS
// ============================================

function updateSteps(activeStep) {
  for (let i = 1; i <= 3; i++) {
    const step = document.getElementById(`step${i}`);
    if (step) {
      step.classList.remove("active", "completed");
      if (i < activeStep) step.classList.add("completed");
      else if (i === activeStep) step.classList.add("active");
    }
  }
}

function buildMatrices() {
  const crits = getLines("criteriaArea");
  const alts = getLines("altArea");
  const container = document.getElementById("critMatrices");
  container.innerHTML = "";

  if (crits.length < 2 || alts.length < 2) {
    alert("Perlu minimal 2 kriteria dan 2 alternatif.");
    return;
  }

  updateSteps(2);

  const critCard = document.createElement("div");
  critCard.className = "card p-4 mb-4 fade-in";
  critCard.innerHTML = `
    <div class="card-header">
      <h5 class="mb-0">⚖️ Perbandingan Antar Kriteria</h5>
      <p class="text-muted mb-0 mt-2">Bandingkan tingkat kepentingan setiap kriteria</p>
    </div>
    <div class="card-body">
      <div class="comparison-table"></div>
    </div>
  `;
  container.appendChild(critCard);
  critCard.querySelector(".comparison-table").appendChild(makeTable(crits));

  crits.forEach((c, idx) => {
    const altCard = document.createElement("div");
    altCard.className = "criterion-card fade-in";
    altCard.style.animationDelay = `${(idx + 1) * 0.1}s`;

    const icons = ["🏆", "📊", "⚽", "🏢", "💰", "👥", "📈", "🎯"];
    const icon = icons[idx % icons.length];

    altCard.innerHTML = `
      <div class="criterion-header">
        <div class="criterion-icon">${icon}</div>
        <div>
          <h5 class="mb-1">${c}</h5>
          <p class="text-muted mb-0 small">Bandingkan alternatif berdasarkan kriteria ini</p>
        </div>
      </div>
      <div class="comparison-table"></div>
    `;
    container.appendChild(altCard);
    altCard.querySelector(".comparison-table").appendChild(makeTable(alts));
  });

  document.getElementById("questionArea").classList.remove("d-none");
  document.getElementById("resultArea").classList.add("d-none");
  container.scrollIntoView({ behavior: "smooth" });
}

function getLines(id) {
  return document
    .getElementById(id)
    .value.split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function makeTable(names) {
  const table = document.createElement("table");
  table.className = "table table-sm table-hover align-middle mb-0";
  const n = names.length;
  let html = "<thead><tr><th></th>";
  names.forEach((nm) => (html += `<th class="text-center">${nm}</th>`));
  html += "</tr></thead><tbody>";

  const options = [
    { value: 9, label: "9 - Mutlak lebih penting" },
    { value: 8, label: "8" },
    { value: 7, label: "7 - Sangat lebih penting" },
    { value: 6, label: "6" },
    { value: 5, label: "5 - Lebih penting" },
    { value: 4, label: "4" },
    { value: 3, label: "3 - Sedikit lebih penting" },
    { value: 2, label: "2" },
    { value: 1, label: "1 - Sama penting", selected: true },
    { value: 0.5, label: "1/2" },
    { value: 0.333, label: "1/3 - Sedikit kurang penting" },
    { value: 0.25, label: "1/4" },
    { value: 0.2, label: "1/5 - Kurang penting" },
    { value: 0.167, label: "1/6" },
    { value: 0.143, label: "1/7 - Sangat kurang penting" },
    { value: 0.125, label: "1/8" },
    { value: 0.111, label: "1/9 - Mutlak kurang penting" },
  ];

  for (let i = 0; i < n; i++) {
    html += `<tr><th>${names[i]}</th>`;
    for (let j = 0; j < n; j++) {
      if (i === j) {
        html +=
          '<td><input type="text" class="form-control form-control-sm text-center" disabled value="1" style="background: rgba(6, 182, 212, 0.1);"></td>';
      } else if (j > i) {
        html += `<td><select class="form-select form-select-sm pair" data-i="${i}" data-j="${j}">`;
        options.forEach((opt) => {
          const selected = opt.selected ? "selected" : "";
          html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
        });
        html += `</select></td>`;
      } else {
        html += `<td><input type="text" class="form-control form-control-sm text-center recip" disabled data-i="${i}" data-j="${j}" value="1" style="background: rgba(148, 163, 184, 0.1);"></td>`;
      }
    }
    html += "</tr>";
  }
  html += "</tbody>";
  table.innerHTML = html;

  table.querySelectorAll(".pair").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const v = parseFloat(e.target.value) || 1;
      const i = e.target.dataset.i,
        j = e.target.dataset.j;
      const recip = table.querySelector(`.recip[data-i='${j}'][data-j='${i}']`);
      if (recip) {
        const recipValue = 1 / v;
        if (recipValue === 1) {
          recip.value = "1";
        } else if (recipValue > 1) {
          recip.value = recipValue.toFixed(0);
        } else {
          recip.value = recipValue.toFixed(3);
        }
      }
    });
  });
  return table;
}

function fillExample() {
  document.getElementById("criteriaArea").value = `Prestasi dan Gelar
Konsistensi Performa
Kualitas Pemain dan Filosofi Permainan
Manajemen dan Infrastruktur Klub`;
  document.getElementById("altArea").value = `Barcelona
Manchester City
Bayern Munich
Liverpool`;
  buildMatrices();

  const allTables = document.querySelectorAll("#critMatrices table");
  fillTableInputs(allTables[0], [2, 4, 3, 2, 1, 0.5]);
  fillTableInputs(allTables[1], [0.5, 0.333, 1, 0.5, 2, 3]);
  fillTableInputs(allTables[2], [0.333, 0.5, 0.5, 2, 2, 1]);
  fillTableInputs(allTables[3], [0.5, 1, 1, 3, 2, 1]);
  fillTableInputs(allTables[4], [0.333, 0.5, 1, 2, 3, 2]);
}

function fillTableInputs(table, values) {
  const inputs = table.querySelectorAll(".pair");
  inputs.forEach((input, i) => {
    if (values[i] !== undefined) {
      input.value = values[i];
      input.dispatchEvent(new Event("change"));
    }
  });
}

// ============================================
// AHP CALCULATION FUNCTIONS
// ============================================

function computeAHP() {
  const allTables = document.querySelectorAll("#critMatrices table");
  const resultArea = document.getElementById("resultArea");
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = "";

  const critNames = getLines("criteriaArea");
  const altNames = getLines("altArea");
  let allConsistent = true;

  if (allTables.length !== critNames.length + 1) {
    alert("Jumlah matriks tidak sesuai. Silakan buat matriks kembali.");
    return;
  }

  updateSteps(3);

  const critAnalysis = processMatrix(allTables[0], critNames);
  summaryDiv.innerHTML += `
    <div class="card p-4 mb-4 fade-in">
      <h5 class="text-info mb-3">📊 Bobot Kriteria</h5>
      ${renderAnalysis(critAnalysis)}
    </div>
  `;

  if (!critAnalysis.isConsistent) {
    summaryDiv.innerHTML += `<div class="alert alert-danger fade-in"><strong>⚠️ Peringatan:</strong> Matriks kriteria tidak konsisten (CR > 0.10).</div>`;
    allConsistent = false;
  }

  const critWeights = critAnalysis.weights;

  let altWeightsPerCrit = [];
  summaryDiv.innerHTML += `<div class="card p-4 mb-4 fade-in"><h5 class="text-info mb-3">⚽ Analisis Alternatif per Kriteria</h5>`;

  for (let i = 0; i < critNames.length; i++) {
    const altAnalysis = processMatrix(allTables[i + 1], altNames);
    summaryDiv.innerHTML += `<h6 class="mt-3">${
      critNames[i]
    }</h6>${renderAnalysis(altAnalysis)}`;
    if (!altAnalysis.isConsistent) {
      summaryDiv.innerHTML += `<div class="alert alert-warning mt-2 small fade-in">Matriks '${critNames[i]}' tidak konsisten.</div>`;
      allConsistent = false;
    }
    altWeightsPerCrit.push(altAnalysis.weights);
  }
  summaryDiv.innerHTML += `</div>`;

  const altWeightsMatrix = transpose(altWeightsPerCrit);
  const finalScores = matrixMultiply(altWeightsMatrix, critWeights);

  const finalResults = altNames
    .map((name, index) => ({
      name: name,
      score: finalScores[index],
    }))
    .sort((a, b) => b.score - a.score);

  summaryDiv.innerHTML += `
    <div class="card p-4 fade-in">
      <h3 class="text-info mb-4">🏆 Hasil Akhir Peringkat</h3>
      <ul class="list-group list-group-flush">
  `;

  finalResults.forEach((res, index) => {
    const logoSrc =
      CLUB_LOGOS[res.name] ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2394a3b8'/%3E%3C/svg%3E";
    const medals = ["🥇", "🥈", "🥉"];
    const medal = medals[index] || "🏅";
    const scorePercent = (res.score * 100).toFixed(2);

    summaryDiv.innerHTML += `
      <li class="list-group-item">
        <div>
          <span class="fw-bold fs-4 me-3">${medal}</span>
          <img src="${logoSrc}" alt="${res.name}" class="club-logo">
          <span class="fs-5">${res.name}</span>
        </div>
        <span class="badge bg-info fs-6">${scorePercent}%</span>
      </li>
    `;
  });

  summaryDiv.innerHTML += `</ul></div>`;

  addToHistory({
    criteria: critNames,
    alternatives: altNames,
    results: finalResults,
    critWeights: critWeights,
    isConsistent: allConsistent,
  });

  drawChart(finalResults);
  resultArea.classList.remove("d-none");
  resultArea.scrollIntoView({ behavior: "smooth" });
}

function processMatrix(tableElement, names) {
  const n = names.length;
  const matrix = [];
  const rows = tableElement.querySelectorAll("tbody tr");

  rows.forEach((tr) => {
    const rowValues = [];
    const cells = tr.querySelectorAll("td");
    cells.forEach((cell) => {
      const input = cell.querySelector("input");
      const select = cell.querySelector("select");
      if (input) {
        rowValues.push(parseFloat(input.value) || 1);
      } else if (select) {
        rowValues.push(parseFloat(select.value) || 1);
      }
    });
    matrix.push(rowValues);
  });

  const colSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }

  const normalizedMatrix = matrix.map((row) =>
    row.map((cell, j) => (colSums[j] === 0 ? 0 : cell / colSums[j]))
  );

  const weights = normalizedMatrix.map(
    (row) => row.reduce((acc, val) => acc + val, 0) / n
  );

  const weightedSumVector = matrixMultiply(matrix, weights);
  const lambdaValues = weightedSumVector.map((val, i) =>
    weights[i] === 0 ? 0 : val / weights[i]
  );
  const lambdaMax = lambdaValues.reduce((acc, val) => acc + val, 0) / n;
  const CI = n <= 2 ? 0 : (lambdaMax - n) / (n - 1);
  const RIn = RI[n] || 0.0;
  const CR = n <= 2 || RIn === 0 ? 0 : CI / RIn;

  return {
    weights: weights,
    lambdaMax: lambdaMax,
    CI: CI,
    CR: CR,
    isConsistent: CR <= 0.1 || n <= 2,
    names: names,
  };
}

function renderAnalysis(analysis) {
  let html = `
    <div class="table-responsive">
      <table class="table table-sm table-hover mb-3">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-end">Bobot</th>
            <th class="text-end">Persentase</th>
          </tr>
        </thead>
        <tbody>
  `;

  analysis.names.forEach((name, i) => {
    const percentage = (analysis.weights[i] * 100).toFixed(2);
    html += `
      <tr>
        <td><strong>${name}</strong></td>
        <td class="text-end">${analysis.weights[i].toFixed(4)}</td>
        <td class="text-end">
          <span class="badge bg-info">${percentage}%</span>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    <div class="row text-center">
      <div class="col-md-4">
        <div class="p-3" style="background: rgba(6,182,212,0.1); border-radius: 0.5rem;">
          <div class="text-muted small">λ max</div>
          <div class="fw-bold text-info fs-5">${analysis.lambdaMax.toFixed(
            4
          )}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-3" style="background: rgba(6,182,212,0.1); border-radius: 0.5rem;">
          <div class="text-muted small">CI</div>
          <div class="fw-bold text-info fs-5">${analysis.CI.toFixed(4)}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-3" style="background: ${
          analysis.isConsistent ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"
        }; border-radius: 0.5rem;">
          <div class="text-muted small">CR</div>
          <div class="fw-bold fs-5" style="color: ${
            analysis.isConsistent ? "#10b981" : "#ef4444"
          };">
            ${analysis.CR.toFixed(4)}
          </div>
          <div class="small mt-1">
            ${analysis.isConsistent ? "✓ Konsisten" : "✗ Tidak Konsisten"}
          </div>
        </div>
      </div>
    </div>
  `;
  return html;
}

function drawChart(results) {
  const ctx = document.getElementById("chartResult").getContext("2d");
  const labels = results.map((r) => r.name);
  const data = results.map((r) => r.score);

  if (myChart) myChart.destroy();

  const colors = [
    "rgba(6, 182, 212, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(139, 92, 246, 0.8)",
  ];

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Skor Akhir",
          data: data,
          backgroundColor: colors,
          borderColor: colors.map((c) => c.replace("0.8", "1")),
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          max: Math.max(...data) * 1.1,
          ticks: {
            color: "#94a3b8",
            callback: function (value) {
              return (value * 100).toFixed(0) + "%";
            },
          },
          grid: { color: "rgba(148, 163, 184, 0.1)" },
        },
        y: {
          ticks: { color: "#e2e8f0", font: { size: 14, weight: "bold" } },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "#06b6d4",
          bodyColor: "#e2e8f0",
          borderColor: "rgba(6, 182, 212, 0.5)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function (context) {
              return "Skor: " + (context.parsed.x * 100).toFixed(2) + "%";
            },
          },
        },
      },
    },
  });
}

// ============================================
// MATH UTILITY FUNCTIONS
// ============================================

function matrixMultiply(matrixA, vectorB) {
  const A_rows = matrixA.length;
  const A_cols = matrixA[0].length;
  const B_rows = vectorB.length;

  if (A_cols !== B_rows) {
    console.error("Matrix multiplication dimension mismatch");
    return [];
  }

  const resultVector = new Array(A_rows).fill(0);
  for (let i = 0; i < A_rows; i++) {
    for (let j = 0; j < A_cols; j++) {
      resultVector[i] += matrixA[i][j] * vectorB[j];
    }
  }
  return resultVector;
}

function transpose(matrix) {
  if (!matrix || matrix.length === 0) return [];
  const numRows = matrix.length;
  const numCols = matrix[0] ? matrix[0].length : 0;
  if (numCols === 0) return [];

  const transposed = Array(numCols)
    .fill(0)
    .map(() => Array(numRows).fill(0));
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }
  return transposed;
}
