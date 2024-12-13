<?php
  ini_set('display_errors', 1);
  ini_set('display_startup_errors', 1);
  error_reporting(E_ALL);

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_POST['info'];

    if ($data == 'login') {
      $username = rawurlencode($_POST['username']);
      $password = rawurlencode($_POST['password']);
      $domain = rawurlencode($_POST['domain']);

      $login = login($username, $password, $domain);
      jsonEncode('login', $login);
    }

    if ($data == 'validate-sid') {
      $sid = rawurlencode($_POST['sid']);
      $domain = rawurlencode($_POST['domain']);

      $validate = validateSID($sid, $domain);
      jsonEncode('validate', $validate);
    }
  }

  /*
  * Function for init jsonEncode.
  */
  function jsonEncode($key, $value) {
    header('Content-Type: application/json');
    echo json_encode([
      $key => $value,
    ]);
  }

  /*
  * Function for get packages info.
  */
  function login($username, $password, $domain) {
    $auth_url = "http://$domain:5000/webapi/entry.cgi?api=SYNO.API.Auth&version=6&method=login&account=$username&passwd=$password&session=FileStation&format=cookie";
    $auth_response = file_get_contents($auth_url);
    $auth_data = json_decode($auth_response, true);

    $login = [];
    if ($auth_data['success']) {
      $login = [
        'sid' => $auth_data['data']['sid'],
        'domain' => $domain,
        'status' => 'true',
        'error' => 'Getting SID succesfully.'
      ];
    }
    else{
      $login = [
        'error' => 'Error traying to get SID.'
      ];
    }

    return $login;
  }

  function validateSID($sid, $domain) {
    $auth_check_url = "http://$domain:5000/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list_share&_sid=$sid";
    $response = file_get_contents($auth_check_url);
    $response_data = json_decode($response, true);

    $validate = [];
    if ($response_data['success']) {
      $validate = [
        'status' => 'true',
        'error' => 'The session is active.'
      ];
    } else {
      $validate = [
        'status' => 'false',
        'error' => 'The SID has expired or is invalid.'
      ];
    }

    return $validate;
  }
?>