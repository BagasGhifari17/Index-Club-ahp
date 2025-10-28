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
  <nav class="navbar navbar-dark bg-dark shadow-sm mb-4">
    <div class="container">
      <a class="navbar-brand fw-bold text-info" href="#">⚽ AHP Football Ranking</a>
      <div>
        <button id="btnExample" class="btn btn-outline-light btn-sm me-2">Gunakan Contoh</button>
        <button id="btnReset" class="btn btn-light btn-sm">Reset</button>
      </div>
    </div>
  </nav>

  <main class="container">
    <div class="card p-4 mb-4">
      <h4>Pengaturan Studi Kasus</h4>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Daftar Kriteria</label>
          <textarea id="criteriaArea" class="form-control" rows="5">Prestasi dan Gelar
Konsistensi Performa
Kualitas Pemain dan Filosofi Permainan
Manajemen dan Infrastruktur Klub</textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label">Alternatif (Klub)</label>
          <textarea id="altArea" class="form-control" rows="5">Barcelona
Manchester City
Bayern Munich
Liverpool</textarea>
        </div>
      </div>
      <div class="mt-3">
        <button id="buildBtn" class="btn btn-info text-dark">Buat Matriks</button>
      </div>
    </div>

    <section id="questionArea" class="card p-4 mb-4 d-none">
      <h4>Matriks Perbandingan</h4>
      <div id="critMatrices"></div>
      <div class="mt-3">
        <button id="computeBtn" class="btn btn-success">Hitung Hasil AHP →</button>
      </div>
    </section>

    <section id="resultArea" class="card p-4 mb-4 d-none">
      <h4>Hasil & Analisis</h4>
      <div id="summary" class="mb-3"></div>
      <canvas id="chartResult" height="120"></canvas>
    </section>
  </main>

  <footer class="text-center text-secondary mt-4 py-3">
    © 2025 AHP Football | Dibuat untuk Studi Kasus Pemilihan Klub Terbaik
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="assets/script.js"></script>
</body>
</html>