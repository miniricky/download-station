<div class="section-row" id="site-cards">
  <div class="container-fluid">
    <?php
    require_once './includes/db.php';
    
    $sql = "SELECT * FROM sites ORDER BY created_at ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $sites = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ?>
    <div class="row">
      <?php
      foreach ($sites as $site) {
        $siteName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $site['name']));
        ?>
        <div class="col-12 col-md-6 col-lg-4">
          <div class="<?php echo $siteName; ?> site-card d-flex flex-column align-items-center">
            <div class="image">
              <a href="./<?php echo $siteName; ?>.php">
                <img src="<?php echo $site['image_url']; ?>" alt="<?php echo $site['name']; ?> logo">
              </a>
            </div>  
          </div>
        </div>
        <?php
      }
      ?>
    </div>
  </div>
</div>