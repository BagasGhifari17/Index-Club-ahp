// Rasio Indeks Acak (Random Index) untuk pengecekan konsistensi
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

// Objek untuk memetakan nama klub ke logo (SVG placeholder)
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

// Variabel global untuk chart
let myChart = null;

// --- Event Listeners ---
document.getElementById("buildBtn").addEventListener("click", buildMatrices);
document.getElementById("computeBtn").addEventListener("click", computeAHP);
document.getElementById("btnExample").addEventListener("click", fillExample);
document
  .getElementById("btnReset")
  .addEventListener("click", () => location.reload());

// --- Fungsi Update Progress Steps ---
function updateSteps(activeStep) {
  for (let i = 1; i <= 3; i++) {
    const step = document.getElementById(`step${i}`);
    step.classList.remove("active", "completed");
    if (i < activeStep) step.classList.add("completed");
    else if (i === activeStep) step.classList.add("active");
  }
}

// --- Fungsi Pembuatan UI ---
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

  // Kriteria comparison card
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

  // Alternative comparison cards
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

  for (let i = 0; i < n; i++) {
    html += `<tr><th>${names[i]}</th>`;
    for (let j = 0; j < n; j++) {
      if (i === j) {
        html +=
          '<td><input type="number" class="form-control form-control-sm" disabled value="1"></td>';
      } else if (j > i) {
        html += `<td><input type="number" step="any" min="0.111" max="9" value="1" class="form-control form-control-sm pair" data-i="${i}" data-j="${j}"></td>`;
      } else {
        html += `<td><input type="number" class="form-control form-control-sm recip" disabled data-i="${i}" data-j="${j}" value="1"></td>`;
      }
    }
    html += "</tr>";
  }
  html += "</tbody>";
  table.innerHTML = html;

  table.querySelectorAll(".pair").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value) || 1;
      const i = e.target.dataset.i,
        j = e.target.dataset.j;
      const recip = table.querySelector(`.recip[data-i='${j}'][data-j='${i}']`);
      if (recip) recip.value = (Math.round((1 / v) * 1000) / 1000).toFixed(3);
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

// --- Fungsi Logika AHP ---
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

  // Process criteria
  const critAnalysis = processMatrix(allTables[0], critNames);
  summaryDiv.innerHTML += `
    <div class="card p-4 mb-4 fade-in">
      <h5 class="text-info mb-3">📊 Bobot Kriteria</h5>
      ${renderAnalysis(critAnalysis)}
    </div>
  `;

  if (!critAnalysis.isConsistent) {
    summaryDiv.innerHTML += `<div class="alert alert-danger fade-in"><strong>⚠️ Peringatan:</strong> Matriks kriteria tidak konsisten (CR > 0.10). Perbaiki nilai perbandingan untuk hasil akurat.</div>`;
    allConsistent = false;
  }

  const critWeights = critAnalysis.weights;

  // Process alternatives
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

  // Final synthesis
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
      <table class="table table-sm table-hover mb-3" style="font-size: 0.95em;">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-end">Bobot (Prioritas)</th>
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
          <span class="badge" style="background: linear-gradient(90deg, rgba(6,182,212,0.3) ${percentage}%, transparent ${percentage}%); color: #06b6d4; min-width: 80px;">
            ${percentage}%
          </span>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    <div class="row text-center" style="font-size: 0.9em;">
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
          <div class="text-muted small">CR (Consistency Ratio)</div>
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

// --- Helper Utilitas Matematika ---
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
