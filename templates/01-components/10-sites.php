<div class="section-row" id="sites">
  <div class="container-fluid">
    <h1>Sites</h1>

    <form id="addSiteForm" class="row row-30" enctype="multipart/form-data">
      <h2 class="h5">Added New Site</h2>

      <div class="d-flex gap-2 col-12 col-md-6 mb-3">
        <label for="site" class="form-label">Site</label>
        <input type="text" class="form-control" id="site" placeholder="Added Site">
      </div>

      <div class="d-flex gap-2 col-12 col-md-6 mb-3">
        <label for="url" class="form-label">URl</label>
        <input type="text" class="form-control" id="url" placeholder="Added URL">
      </div>

      <div class="d-flex gap-2 col-12 col-md-6 mb-3">
        <label for="image" class="form-label">Image</label>
        <input class="form-control" type="file" id="image">
      </div>

      <div class="col-12 col-md-6 mb-3">
        <button type="submit" class="btn btn-secondary w-100">Added new site</button>
      </div>
    </form>

    <div class="row row-30">
      <?php
      require_once './includes/db.php';
      
      $sql = "SELECT * FROM sites ORDER BY created_at DESC";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      $sites = $stmt->fetchAll(PDO::FETCH_ASSOC);

      foreach ($sites as $site) {
        $siteName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $site['name']));
        ?>
        <div class="col-12 col-md-6 col-lg-4">
          <div class="<?php echo $siteName; ?>-wrapper d-flex flex-column align-items-center">
            <div class="image">
              <img src="<?php echo $site['image_url']; ?>" alt="<?php echo $site['name']; ?> logo">
            </div>

            <div class="body d-flex flex-column">
              <button type="button" id="onAir" class="btn btn-link <?php echo $siteName; ?>-status">On Air</button>
              <button type="button" id="finished" class="btn btn-link <?php echo $siteName; ?>-status">Finished</button>
            </div>

            <div class="progress-wrapper w-100 text-center"></div>
          </div>
        </div>
        <?php
      }
      ?>
    </div>
  </div>
</div>