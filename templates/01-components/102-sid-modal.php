<div class="modal fade" id="sidModal" tabindex="-1" aria-labelledby="sidModallLabel" aria-hidden="true">
  <div class="modal-dialog modal-fullscreen">
    <div class="modal-content bg-dark text-white">
      <div class="modal-header">
        <h1 class="modal-title fs-5">Synology Credentials</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="section-row h-100" id="sid">
          <div class="container h-100 align-content-center">
            <form id="sid-form">
              <h1 class="h3 fw-normal">Add your credentials</h1>

              <label for="username">Username</label>
              <input type="text" class="form-control" id="username" aria-describedby="username" placeholder="Username">

              <label for="password">Password</label>
              <input type="password" class="form-control" id="password" aria-describedby="password" placeholder="Password" autocomplete="current-password">

              <label for="domain">Domain</label>
              <input type="text" class="form-control" id="domain" aria-describedby="domain" placeholder="Domain">

              <span id="session" class="form-text d-block text-white">
                Your credentials are only saved in cookies, not in the database.
              </span>

              <button class="btn btn-primary w-100 py-2" id="" type="submit">Add credentials</button>
            </form>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>