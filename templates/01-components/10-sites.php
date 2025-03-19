<div class="section-row" id="sites">
  <div class="container-fluid">
    <h1>Sitios</h1>

    <form id="addSiteForm" class="row row-30" enctype="multipart/form-data">
      <h2 class="h5">Agregar nuevo sitio</h2>

      <div class="d-flex gap-2 col-12 col-md-6 mb-3">
        <label for="site" class="form-label">Sitio</label>
        <input type="text" class="form-control" id="site" placeholder="Agregar Sitio">
      </div>

      <div class="d-flex gap-2 col-12 col-md-6 mb-3">
        <label for="url" class="form-label">URl</label>
        <input type="text" class="form-control" id="url" placeholder="Agregar URL">
      </div>

      <div class="d-flex gap-2 col-12 col-md-6 mb-3">
        <label for="image" class="form-label">Imagen</label>
        <input class="form-control" type="file" id="image">
      </div>

      <div class="col-12 col-md-6 mb-3">
        <button type="submit" class="btn btn-secondary w-100">Agregar nuevo sitio</button>
      </div>
    </form>
  </div>
</div>