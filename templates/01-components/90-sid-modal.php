<div class="modal fade" id="sidModal" tabindex="-1" aria-labelledby="sidModallLabel" aria-hidden="true">
  <div class="modal-dialog modal-fullscreen">
    <div class="modal-content bg-purple text-white">
      <div class="modal-header">
        <h1 class="modal-title fs-5">Credenciales de Synology</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="section-row h-100" id="sid">
          <div class="container h-100 align-content-center">
            <form id="sid-form">
              <h1 class="h3 fw-normal">Añade tus credenciales</h1>

              <label for="username">Usuario</label>
              <input type="text" class="form-control" id="username" aria-describedby="username" placeholder="Usuario">

              <label for="password">Contraseña</label>
              <input type="password" class="form-control" id="password" aria-describedby="password" placeholder="Contraseña" autocomplete="current-password">

              <label for="domain">Dominio</label>
              <input type="text" class="form-control" id="domain" aria-describedby="domain" placeholder="Dominio">

              <span id="session" class="form-text d-block text-white">
                Sus credenciales solo se guardan en las cookies, no en la base de datos.
              </span>

              <button class="btn btn-secondary w-100 py-2" id="" type="submit">Agregar credenciales</button>
            </form>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>