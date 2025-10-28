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

// Objek untuk memetakan nama klub ke path logo
// Sesuaikan nama file logo jika berbeda
const CLUB_LOGOS = {
  Barcelona: "assets/images/barcelona.png",
  "Manchester City": "assets/images/manchestercity.png",
  "Bayern Munich": "assets/images/bayernmunich.png",
  Liverpool: "assets/images/liverpool.png",
  // Tambahkan klub lain di sini jika Anda menggunakannya
};

// Variabel global untuk menyimpan instance chart agar bisa dihancurkan (destroy)
let myChart = null;

// --- Event Listeners ---
document.getElementById("buildBtn").addEventListener("click", buildMatrices);
document.getElementById("computeBtn").addEventListener("click", computeAHP);
document.getElementById("btnExample").addEventListener("click", fillExample);
document
  .getElementById("btnReset")
  .addEventListener("click", () => location.reload());

// --- Fungsi Pembuatan UI ---

/**
 * Membangun semua tabel matriks perbandingan berdasarkan input pengguna.
 */
function buildMatrices() {
  const crits = getLines("criteriaArea");
  const alts = getLines("altArea");
  const container = document.getElementById("critMatrices");
  container.innerHTML = ""; // Bersihkan matriks sebelumnya

  if (crits.length < 2 || alts.length < 2) {
    alert("Perlu minimal 2 kriteria dan 2 alternatif.");
    return;
  }

  // Tabel kriteria
  container.innerHTML += `<h5 class="text-info mt-3">Matriks Perbandingan Kriteria</h5><p class="text-secondary small">Seberapa penting setiap kriteria dibandingkan dengan kriteria lainnya?</p>`;
  container.appendChild(makeTable(crits));

  // Tabel per kriteria
  crits.forEach((c) => {
    container.innerHTML += `<h6 class="text-light mt-4">Perbandingan Alternatif untuk Kriteria: <span class="text-info">${c}</span></h6><p class="text-secondary small">Manakah alternatif yang lebih baik berdasarkan kriteria ini?</p>`;
    container.appendChild(makeTable(alts));
  });

  document.getElementById("questionArea").classList.remove("d-none");
  document.getElementById("resultArea").classList.add("d-none");
  container.scrollIntoView({ behavior: "smooth" });
}

/**
 * Helper untuk mengambil teks dari textarea dan mengubahnya menjadi array.
 * @param {string} id - ID elemen textarea.
 * @returns {string[]} - Array dari baris teks.
 */
function getLines(id) {
  return document
    .getElementById(id)
    .value.split("\n")
    .map((v) => v.trim())
    .filter(Boolean); // Menghapus baris kosong
}

/**
 * Membuat elemen <table> untuk matriks perbandingan.
 * @param {string[]} names - Nama-nama kriteria atau alternatif.
 * @returns {HTMLTableElement} - Elemen tabel yang sudah jadi.
 */
function makeTable(names) {
  const table = document.createElement("table");
  table.className = "table table-sm table-dark align-middle";
  const n = names.length;
  let html = "<thead><tr><th></th>";
  names.forEach((nm) => (html += `<th>${nm}</th>`));
  html += "</tr></thead><tbody>";

  for (let i = 0; i < n; i++) {
    html += `<tr><th>${names[i]}</th>`;
    for (let j = 0; j < n; j++) {
      if (i === j) {
        // Diagonal
        html +=
          '<td><input type="number" class="form-control form-control-sm text-center" disabled value="1"></td>';
      } else if (j > i) {
        // Input manual (segitiga atas)
        html += `<td><input type="number" step="any" min="0.111" max="9" value="1" class="form-control form-control-sm text-center pair" data-i="${i}" data-j="${j}"></td>`;
      } else {
        // Resiprokal (segitiga bawah)
        html += `<td><input type="number" class="form-control form-control-sm text-center recip" disabled data-i="${i}" data-j="${j}" value="1"></td>`;
      }
    }
    html += "</tr>";
  }
  html += "</tbody>";
  table.innerHTML = html;

  // Tambahkan event listener untuk mengupdate nilai resiprokal secara otomatis
  table.querySelectorAll(".pair").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value) || 1;
      const i = e.target.dataset.i,
        j = e.target.dataset.j;
      const recip = table.querySelector(`.recip[data-i='${j}'][data-j='${i}']`);
      if (recip) recip.value = (1 / v).toFixed(3);
    });
  });
  return table;
}

/**
 * Mengisi data contoh untuk demonstrasi.
 */
function fillExample() {
  document.getElementById("criteriaArea").value = `Prestasi dan Gelar
Konsistensi Performa
Kualitas Pemain dan Filosofi Permainan
Manajemen dan Infrastruktur Klub`;

  document.getElementById("altArea").value = `Barcelona
Manchester City
Bayern Munich
Liverpool`;

  buildMatrices(); // Bangun tabel terlebih dahulu

  // Ambil semua tabel yang baru dibuat
  const allTables = document.querySelectorAll("#critMatrices table");

  // Data contoh untuk Matriks Kriteria
  // (C1vC2=2, C1vC3=4, C1vC4=3, C2vC3=2, C2vC4=1, C3vC4=0.5)
  const critValues = [2, 4, 3, 2, 1, 0.5];
  fillTableInputs(allTables[0], critValues);

  // Data contoh untuk "Prestasi"
  // (A1vA2=0.5, A1vA3=0.33, A1vA4=1, A2vA3=0.5, A2vA4=2, A3vA4=3)
  const alt1Values = [0.5, 0.333, 1, 0.5, 2, 3];
  fillTableInputs(allTables[1], alt1Values);

  // Data contoh untuk "Konsistensi"
  // (A1vA2=0.33, A1vA3=0.5, A1vA4=0.5, A2vA3=2, A2vA4=2, A3vA4=1)
  const alt2Values = [0.333, 0.5, 0.5, 2, 2, 1];
  fillTableInputs(allTables[2], alt2Values);

  // Data contoh untuk "Kualitas Pemain"
  // (A1vA2=0.5, A1vA3=1, A1vA4=1, A2vA3=3, A2vA4=2, A3vA4=1)
  const alt3Values = [0.5, 1, 1, 3, 2, 1];
  fillTableInputs(allTables[3], alt3Values);

  // Data contoh untuk "Manajemen"
  // (A1vA2=0.33, A1vA3=0.5, A1vA4=1, A2vA3=2, A2vA4=3, A3vA4=2)
  const alt4Values = [0.333, 0.5, 1, 2, 3, 2];
  fillTableInputs(allTables[4], alt4Values);
}

/**
 * Helper untuk mengisi input dalam tabel dengan data contoh.
 * @param {HTMLTableElement} table - Elemen tabel yang akan diisi.
 * @param {number[]} values - Array nilai untuk diisikan.
 */
function fillTableInputs(table, values) {
  const inputs = table.querySelectorAll(".pair");
  inputs.forEach((input, i) => {
    if (values[i] !== undefined) {
      input.value = values[i];
      // Triger event 'input' agar nilai resiprokal juga terupdate
      input.dispatchEvent(new Event("input"));
    }
  });
}

// --- Fungsi Logika AHP ---

/**
 * Fungsi utama untuk menjalankan seluruh perhitungan AHP.
 */
function computeAHP() {
  const allTables = document.querySelectorAll("#critMatrices table");
  const resultArea = document.getElementById("resultArea");
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = ""; // Bersihkan hasil sebelumnya

  const critNames = getLines("criteriaArea");
  const altNames = getLines("altArea");
  let allConsistent = true;

  // Validasi jumlah tabel
  if (allTables.length !== critNames.length + 1) {
    alert(
      "Jumlah matriks perbandingan tidak sesuai dengan jumlah kriteria. Pastikan Anda sudah 'Buat Matriks' kembali setelah mengubah daftar kriteria/alternatif."
    );
    return;
  }

  // 1. Proses Matriks Kriteria
  const critAnalysis = processMatrix(allTables[0], critNames);
  summaryDiv.innerHTML += "<h5>Bobot Kriteria</h5>";
  summaryDiv.innerHTML += renderAnalysis(critAnalysis);
  if (!critAnalysis.isConsistent) {
    summaryDiv.innerHTML += `<div class="alert alert-danger mt-2"><b>Peringatan:</b> Matriks perbandingan kriteria TIDAK KONSISTEN (CR > 0.10). Harap perbaiki nilai perbandingan Anda untuk hasil yang akurat.</div>`;
    allConsistent = false;
  }
  const critWeights = critAnalysis.weights; // [Crit x 1]

  // 2. Proses Matriks Alternatif (satu per satu)
  let altWeightsPerCrit = [];
  summaryDiv.innerHTML += "<hr><h5>Analisis Alternatif per Kriteria</h5>";

  for (let i = 0; i < critNames.length; i++) {
    const altTable = allTables[i + 1]; // +1 untuk melewati tabel kriteria
    const altAnalysis = processMatrix(altTable, altNames);

    summaryDiv.innerHTML += `<h6 class="mt-3">Berdasarkan: ${critNames[i]}</h6>`;
    summaryDiv.innerHTML += renderAnalysis(altAnalysis);
    if (!altAnalysis.isConsistent) {
      summaryDiv.innerHTML += `<div class="alert alert-warning mt-2 small">Matriks untuk '${critNames[i]}' tidak konsisten (CR > 0.10).</div>`;
      allConsistent = false;
    }
    altWeightsPerCrit.push(altAnalysis.weights);
  }

  if (!allConsistent) {
    summaryDiv.innerHTML += `<hr><div class="alert alert-danger"><b>Peringatan Global:</b> Satu atau lebih matriks tidak konsisten. Hasil akhir mungkin tidak dapat diandalkan.</div>`;
  }

  // 3. Sintesis Hasil Akhir
  // Kita punya bobot kriteria [Crit x 1]
  // Kita punya bobot alternatif [Crit x Alt]
  // Kita perlu [Alt x Crit] untuk dikalikan.
  const altWeightsMatrix = transpose(altWeightsPerCrit); // [Alt x Crit]

  // Kalikan [Alt x Crit] * [Crit x 1] = [Alt x 1]
  const finalScores = matrixMultiply(altWeightsMatrix, critWeights);

  // 4. Format dan Tampilkan Hasil
  const finalResults = altNames
    .map((name, index) => ({
      name: name,
      score: finalScores[index],
    }))
    .sort((a, b) => b.score - a.score); // Urutkan dari skor tertinggi

  summaryDiv.innerHTML +=
    "<hr><h3 class='text-info'>🏆 Hasil Akhir Peringkat</h3>";
  let rankHtml = '<ul class="list-group list-group-flush">';
  finalResults.forEach((res, index) => {
    // Dapatkan URL logo, fallback ke placeholder jika tidak ditemukan
    const logoSrc =
      CLUB_LOGOS[res.name] ||
      "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; // Placeholder transparan
    const logoAlt = `${res.name} Logo`;

    rankHtml += `<li class="list-group-item">
        <div>
          <span class="fw-bold fs-5 me-2">${index + 1}.</span>
          <img src="${logoSrc}" alt="${logoAlt}" class="club-logo">
          <span>${res.name}</span>
        </div>
        <span class="badge bg-info rounded-pill fs-6">${(
          res.score * 100
        ).toFixed(2)}%</span>
      </li>`;
  });
  rankHtml += "</ul>";
  summaryDiv.innerHTML += rankHtml;

  // 5. Tampilkan Chart
  drawChart(finalResults);

  resultArea.classList.remove("d-none");
  resultArea.scrollIntoView({ behavior: "smooth" });
}

/**
 * Memproses satu matriks perbandingan untuk mendapatkan bobot dan rasio konsistensi.
 * @param {HTMLTableElement} tableElement - Elemen tabel yang akan diproses.
 * @param {string[]} names - Nama item (kriteria/alternatif).
 * @returns {object} - Objek berisi bobot, CR, CI, dll.
 */
function processMatrix(tableElement, names) {
  const n = names.length;

  // 1. Baca nilai dari tabel ke matriks 2D
  const matrix = [];
  const rows = tableElement.querySelectorAll("tbody tr");
  rows.forEach((tr) => {
    const inputs = tr.querySelectorAll("input");
    const rowValues = [];
    inputs.forEach((input) => {
      rowValues.push(parseFloat(input.value));
    });
    matrix.push(rowValues);
  });

  // 2. Normalisasi matriks (Metode Eigenvector Perkiraan)
  // a. Hitung jumlah setiap kolom
  const colSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }

  // Tangani kasus pembagian nol jika ada kolom yang jumlahnya nol
  const normalizedMatrix = matrix.map((row) =>
    row.map((cell, j) => (colSums[j] === 0 ? 0 : cell / colSums[j]))
  );

  // 3. Hitung Vektor Prioritas (Bobot)
  // Rata-rata setiap baris dari matriks yang dinormalisasi
  const weights = normalizedMatrix.map(
    (row) => row.reduce((acc, val) => acc + val, 0) / n
  );

  // 4. Hitung Rasio Konsistensi (CR)
  // a. Hitung (Matriks Awal * Vektor Bobot)
  const weightedSumVector = matrixMultiply(matrix, weights);

  // b. Hitung (WeightedSumVector / Vektor Bobot)
  const lambdaValues = weightedSumVector.map((val, i) =>
    weights[i] === 0 ? 0 : val / weights[i]
  ); // Handle division by zero

  // c. Hitung Lambda-max (rata-rata dari lambdaValues)
  const lambdaMax = lambdaValues.reduce((acc, val) => acc + val, 0) / n;

  // d. Hitung Consistency Index (CI)
  const CI = n <= 2 ? 0 : (lambdaMax - n) / (n - 1);

  // e. Ambil Random Index (RI)
  const RIn = RI[n] || 0.0; // Gunakan 0.0 jika n tidak ada di RI (misal n > 10, atau n=0)

  // f. Hitung Consistency Ratio (CR)
  const CR = n <= 2 || RIn === 0 ? 0 : CI / RIn; // Handle division by zero for RIn

  return {
    weights: weights,
    lambdaMax: lambdaMax,
    CI: CI,
    CR: CR,
    isConsistent: CR <= 0.1 || n <= 2, // Matriks 1x1 atau 2x2 selalu konsisten
    names: names,
  };
}

/**
 * Menampilkan hasil analisis (bobot dan CR) dalam format tabel HTML.
 * @param {object} analysis - Objek hasil dari processMatrix.
 * @returns {string} - String HTML tabel.
 */
function renderAnalysis(analysis) {
  let html = `<table class="table table-sm table-dark table-bordered" style="font-size: 0.9em;">
        <thead><tr><th>Item</th><th>Bobot (Prioritas)</th></tr></thead>
        <tbody>`;
  analysis.names.forEach((name, i) => {
    html += `<tr>
            <td>${name}</td>
            <td>${analysis.weights[i].toFixed(4)}</td>
        </tr>`;
  });
  html += `</tbody><tfoot class="text-secondary" style="font-size: 0.85em;">
        <tr>
            <td>&lambda;<sub>max</sub></td>
            <td>${analysis.lambdaMax.toFixed(4)}</td>
        </tr>
        <tr>
            <td>CI</td>
            <td>${analysis.CI.toFixed(4)}</td>
        </tr>
        <tr class="${
          analysis.isConsistent ? "text-success" : "text-danger" // Gunakan text-success/danger langsung, bukan -emphasis
        } fw-bold">
            <td>CR (Ratio)</td>
            <td>${analysis.CR.toFixed(4)} (${
    analysis.isConsistent ? "Konsisten" : "TIDAK KONSISTEN"
  })</td>
        </tr>
    </tfoot></table>`;
  return html;
}

/**
 * Menggambar chart batang horizontal menggunakan Chart.js.
 * @param {object[]} results - Array objek hasil akhir {name, score}.
 */
function drawChart(results) {
  const ctx = document.getElementById("chartResult").getContext("2d");
  const labels = results.map((r) => r.name);
  const data = results.map((r) => r.score);

  // Hancurkan chart sebelumnya jika ada
  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Skor Akhir",
          data: data,
          backgroundColor: [
            "rgba(6, 182, 212, 0.7)",
            "rgba(14, 165, 163, 0.7)",
            "rgba(13, 148, 136, 0.7)",
            "rgba(15, 118, 110, 0.7)",
          ],
          borderColor: ["#06b6d4", "#0ea5a3", "#0d9488", "#0f766e"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y", // Membuat chart menjadi horizontal
      responsive: true,
      maintainAspectRatio: false, // Penting untuk mengontrol tinggi
      height: 400, // Misalnya, atur tinggi chart
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: "#e6eef6" },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          max: 1, // Agar sumbu X dari 0 sampai 1 (untuk persentase)
        },
        y: {
          ticks: { color: "#e6eef6" },
          grid: { display: false },
        },
      },
      plugins: {
        legend: {
          display: false, // Sembunyikan legenda
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.x !== null) {
                label += (context.parsed.x * 100).toFixed(2) + "%";
              }
              return label;
            },
          },
        },
      },
    },
  });
}

// --- Helper Utilitas Matematika ---

/**
 * Mengalikan Matriks A [n x m] dengan Vektor B [m x 1].
 * @param {number[][]} matrixA - Matriks 2D.
 * @param {number[]} vectorB - Vektor (array 1D).
 * @returns {number[]} - Vektor hasil [n x 1].
 */
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

/**
 * Mentransposisi matriks 2D (mengubah baris menjadi kolom).
 * @param {number[][]} matrix - Matriks yang akan ditransposisi.
 * @returns {number[][]} - Matriks baru yang sudah ditransposisi.
 */
function transpose(matrix) {
  if (!matrix || matrix.length === 0) return [];
  // Pastikan baris memiliki panjang yang sama untuk mencegah error
  const numRows = matrix.length;
  const numCols = matrix[0] ? matrix[0].length : 0;
  if (numCols === 0) return []; // Matriks kosong

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
