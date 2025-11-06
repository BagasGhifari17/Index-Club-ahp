<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AHP - Klub Sepak Bola Terbaik</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-dark shadow-sm mb-4">
    <div class="container">
      <a class="navbar-brand fw-bold text-info" href="#" style="font-size: 1.25rem;">
        ⚽ AHP Football Ranking
      </a>
      <div>
        <button id="btnHistory" class="btn btn-outline-info btn-sm me-2 position-relative">
          📜 Riwayat
          <span id="historyBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">
            0
          </span>
        </button>
        <button id="btnExample" class="btn btn-outline-light btn-sm me-2">
          📋 Contoh
        </button>
        <button id="btnReset" class="btn btn-light btn-sm">
          🔄 Reset
        </button>
      </div>
    </div>
  </nav>

  <main class="container">
    <!-- History Panel (Sidebar) -->
    <div id="historyPanel" class="history-panel d-none">
      <div class="history-panel-header">
        <h5 class="mb-0">📜 Riwayat Perhitungan</h5>
        <button class="btn-close btn-close-white" onclick="toggleHistory()"></button>
      </div>
      <div class="history-panel-body">
        <div id="emptyHistory" class="text-center text-muted py-5">
          <div style="font-size: 4rem; opacity: 0.3;">📭</div>
          <p class="mb-0">Belum ada riwayat</p>
          <small>Hasil perhitungan akan tersimpan otomatis</small>
        </div>
        <div id="historyList"></div>
      </div>
      <div class="history-panel-footer">
        <button id="btnExportHistory" class="btn btn-sm btn-outline-success w-100 mb-2">
          💾 Ekspor Riwayat (JSON)
        </button>
        <button id="btnClearHistory" class="btn btn-sm btn-outline-danger w-100">
          🗑️ Hapus Semua Riwayat
        </button>
      </div>
    </div>
    <!-- Progress Steps -->
    <div class="progress-steps">
      <div class="step active" id="step1">
        <div class="step-circle">1</div>
        <div class="step-label">Setup</div>
      </div>
      <div class="step" id="step2">
        <div class="step-circle">2</div>
        <div class="step-label">Perbandingan</div>
      </div>
      <div class="step" id="step3">
        <div class="step-circle">3</div>
        <div class="step-label">Hasil</div>
      </div>
    </div>

    <!-- Setup Section -->
    <div class="card p-4 mb-4 fade-in" id="setupCard">
      <div class="card-header">
        <h4 class="mb-0">⚙️ Pengaturan Studi Kasus</h4>
        <p class="text-muted mb-0 mt-2">Tentukan kriteria penilaian dan alternatif klub yang akan dibandingkan</p>
      </div>
      <div class="card-body">
        <div class="row g-4">
          <div class="col-md-6">
            <label class="form-label fw-semibold">
              📊 Daftar Kriteria
              <small class="text-muted">(satu per baris)</small>
            </label>
            <textarea id="criteriaArea" class="form-control" rows="6" placeholder="Masukkan kriteria penilaian...">Prestasi dan Gelar
Konsistensi Performa
Kualitas Pemain dan Filosofi Permainan
Manajemen dan Infrastruktur Klub</textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">
              🏆 Alternatif (Klub)
              <small class="text-muted">(satu per baris)</small>
            </label>
            <textarea id="altArea" class="form-control" rows="6" placeholder="Masukkan nama klub...">Barcelona
Manchester City
Bayern Munich
Liverpool</textarea>
          </div>
        </div>
        <div class="mt-4 text-center">
          <button id="buildBtn" class="btn btn-primary btn-lg">
            ➡️ Lanjut ke Perbandingan
          </button>
        </div>
      </div>
    </div>

    <!-- Comparison Section -->
    <section id="questionArea" class="mb-4 d-none">
      <!-- Scale Info -->
      <div class="scale-info">
        <h6>📏 Panduan Pengisian Perbandingan (Saaty Scale)</h6>
        <p class="small text-muted mb-3">Pilih nilai dari dropdown untuk membandingkan tingkat kepentingan. Nilai resiprokal akan otomatis terisi.</p>
        <div class="row">
          <div class="col-md-6">
            <div class="scale-item">
              <span class="scale-value">9</span>
              <span><strong>Mutlak lebih penting</strong> - A jauh lebih penting dari B</span>
            </div>
            <div class="scale-item">
              <span class="scale-value">7</span>
              <span><strong>Sangat lebih penting</strong> - A sangat lebih penting dari B</span>
            </div>
            <div class="scale-item">
              <span class="scale-value">5</span>
              <span><strong>Lebih penting</strong> - A lebih penting dari B</span>
            </div>
            <div class="scale-item">
              <span class="scale-value">3</span>
              <span><strong>Sedikit lebih penting</strong> - A sedikit lebih penting dari B</span>
            </div>
            <div class="scale-item">
              <span class="scale-value">1</span>
              <span><strong>Sama penting</strong> - A dan B sama pentingnya</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="scale-item">
              <span class="scale-value">1/3</span>
              <span><strong>Sedikit kurang penting</strong> - A sedikit kurang penting dari B</span>
            </div>
            <div class="scale-item">
              <span class="scale-value">1/5</span>
              <span><strong>Kurang penting</strong> - A kurang penting dari B</span>
            </div>
            <div class="scale-item">
              <span class="scale-value">1/7</span>
              <span><strong>Sangat kurang penting</strong> - A sangat kurang penting dari B</span>
            </div>
            <div class="scale-item">
              <span class="scale-value">1/9</span>
              <span><strong>Mutlak kurang penting</strong> - A jauh kurang penting dari B</span>
            </div>
            <div class="scale-item mt-2">
              <span class="badge bg-info">💡 Tips:</span>
              <span class="small">Nilai 2, 4, 6, 8 untuk nilai antara</span>
            </div>
          </div>
        </div>
      </div>

      <div id="critMatrices"></div>
      
      <div class="text-center mt-4">
        <button class="btn btn-outline-light me-3" onclick="document.getElementById('setupCard').scrollIntoView({behavior: 'smooth'})">
          ← Kembali
        </button>
        <button id="computeBtn" class="btn btn-success btn-lg">
          🧮 Hitung Hasil AHP
        </button>
      </div>
    </section>

    <!-- Result Section -->
    <section id="resultArea" class="mb-4 d-none">
      <div class="card p-4 fade-in">
        <div class="card-header">
          <h4 class="mb-0">📈 Hasil & Analisis</h4>
        </div>
        <div class="card-body">
          <div id="summary" class="mb-4"></div>
          <div style="height: 400px; position: relative;">
            <canvas id="chartResult"></canvas>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="text-center text-muted mt-5 py-4">
    <small>© 2025 AHP Football Ranking | Dibuat untuk Studi Kasus Pemilihan Klub Terbaik</small>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="assets/script.js"></script>
</body>
</html>