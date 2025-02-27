<?php
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $data = $_GET['info'];
  $sid = $_COOKIE['sid'];
  $domain = $_COOKIE['domain'];

  if ($data == 'get-path') {
    $folder = getPath($sid, $domain);
    jsonEncode('folder', $folder);
  }

  if ($data == 'verify-episodes') {
    $title = $_GET['title'];
    $episodes = $_GET['episodes'];

    $verify = verifyEpisodes($sid, $domain, $title, $episodes);
    jsonEncode('verify', $verify);
  }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = $_POST['info'];
  $sid = $_COOKIE['sid'];
  $domain = $_COOKIE['domain'];

  if ($data == 'download-station') {
    $url = $_POST['url'];
    $title = $_POST['title'];
    $episode = $_POST['episode'];
    $download = verifyFolder($title, $url, $episode, $sid, $domain);
    jsonEncode('download', $download);
  }

  if ($data == 'id-download') {
    $name = $_POST['name'];
    $id = idDownload($sid, $name, $domain);
    jsonEncode('id', $id, $domain);
  }

  if ($data == 'info-download') {
    $id = $_POST['id'];
    $info = infoDownload($sid, $id, $domain);
    jsonEncode('info', $info);
  }

  if ($data == 'rename-file') {
    $title = $_POST['title'];
    $name = $_POST['name'];
    $episode = $_POST['episode'];
    $rename = renameFile($sid, $domain, $title, $name, $episode);
    jsonEncode('rename', $rename);
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
 * Function for get folder.
 */
function getPath($sid, $domain) {
  $get_path_url = "http://$domain:5000/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list_share&_sid=$sid";
  $get_path_response = file_get_contents($get_path_url);
  $get_path_data = json_decode($get_path_response, true);

  $folder = [];
  if ($get_path_data['success']) {
    foreach ($get_path_data['data']['shares'] as $share) {
      $folder[] = [
        'path' => $share['name']
      ];
    }
  } else {
    $folder = [
      'error' => 'Failed to retrieve shared folders.'
    ];
  }

  return $folder;
}

/*
 * Function for verify if episode exist in synology folder.
 */
function verifyEpisodes($sid, $domain, $title, $episodes) {
  $title = str_replace(':', ' -', $title);
  $path = '/anime/' . $title;
  $pathEncode = rawurlencode($path);

  $list_url = "http://$domain:5000/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=$pathEncode&_sid=$sid";
  $list_response = file_get_contents($list_url);
  $list_data = json_decode($list_response, true);

  $verify = [];
  if ($list_data['success']) {
    foreach($episodes as $episode) {
      $name = $title.' - '. $episode. '.mp4';
      $found = false;

      foreach($list_data['data']['files'] as $data) {
        if ($data['name'] === $name) {
          $found = true;
          break;
        }
      }

      $verify[] = [
        'status' => $found ? 'true' : 'false',
        'episode' => $episode
      ];
    }
  }
  else{
    $verify[] = [
      'status' => 'false',
      'episode' => 'none',
    ];
  }

  return $verify;
}

/*
 * Function for verify if the folder exist.
 */
function verifyFolder($title, $url, $episode, $sid, $domain) {
  $title = str_replace(':', ' -', $title);
  $path = '/anime';
  $pathEncode = 'anime/' . $title;
  $title = rawurlencode($title);

  $create_folder_url = "http://$domain:5000/webapi/entry.cgi?api=SYNO.FileStation.CreateFolder&version=2&method=create&folder_path=$path&name=$title&_sid=$sid";
  $create_folder_response = file_get_contents($create_folder_url);
  $create_folder_data = json_decode($create_folder_response, true);
  $download = [];

  if ($create_folder_data['success']) {
    $download = initDownload($sid, rawurlencode($url), rawurlencode($pathEncode), $episode, $domain);
  } else {
    $download = [
      'error' => 'Error creating folder: ' . $create_folder_data['error']['code']
    ];
  }

  return $download;
}

/*
 * Function for initilizing download.
 */
function initDownload($sid, $url, $pathEncode, $episode, $domain) {
  $download_url = "http://$domain:5000/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=create&uri=$url&destination=$pathEncode&_sid=$sid";
  $download_response = file_get_contents($download_url);
  $download_data = json_decode($download_response, true);
  $download = [];

  if ($download_data['success']) {
    $download = [
      'status' => 'true',
      'message' => $episode . ' download will start soon.'
    ];
  } else {
    $download = [
      'error' => $episode . ' error starting download.'
    ];
  }

  return $download;
}

/*
 * Function get download id.
 */
function idDownload($sid, $name, $domain) {
  $list_url = "http://$domain:5000/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=list&_sid=$sid";
  $list_response = file_get_contents($list_url);
  $list_data = json_decode($list_response, true);
  $id = [];

  if ($list_data['success']) {
    if (!empty($list_data['data']['tasks'])) {
      foreach ($list_data['data']['tasks'] as $task) {
        if ($task['title'] == $name) {
          $id = [
            'id' => $task['id'],
            'download' => $task['status']
          ];
        }
      }
    }
    else{
      $id = [
        'error' => 'No downloads found.'
      ];
    }
  } else {
    $id = [
      'error' => 'Error trying to get downloads'
    ];
  }

 
  return $id;
}

/*
 * Function for get info download.
 */
function infoDownload($sid, $id, $domain) {
  $list_url = "http://$domain:5000/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=getinfo&id=$id&additional=detail,transfer&_sid=$sid";
  $list_response = file_get_contents($list_url);
  $list_data = json_decode($list_response, true);

  if ($list_data['success']) {
    $task_info = $list_data['data']['tasks'][0];

    $size = $task_info['size'] / (1024 * 1024);
    $download = $task_info['additional']['transfer']['size_downloaded'] / (1024 * 1024);
    $speed = $task_info['additional']['transfer']['speed_download'] / (1024 * 1024);

    $info = [
      'size' => number_format($size, 2),
      'download' => number_format($download, 2),
      'speed' => number_format($speed, 2),
      'status' => $task_info['status']
    ];
  }
  else{
    $info = [
      'status' => $task_info['status']
    ];
  }

  return $info;
}

/*
 * Function for rename file.
 */
function renameFile($sid, $domain, $title, $name, $episode){
  $title = str_replace(':', ' -', $title);
  $path = '/anime/' . $title . '/' . $name;
  $pathEncode = str_replace('%2F', '/', rawurlencode($path));
  $episode = $title . ' - ' . $episode  . '.mp4';
  $episodeEncode = rawurlencode($episode);

  $rename_url = "http://$domain:5000/webapi/entry.cgi?api=SYNO.FileStation.Rename&version=2&method=rename&path=$pathEncode&name=$episodeEncode&_sid=$sid";
  $rename_response = file_get_contents($rename_url);
  $rename_data = json_decode($rename_response, true);

  if ($rename_data['success'] == 1) {
    $rename = [
      'status' => 'true',
      'error' => 'Name updated successfully.'
    ];
  }
  else{
    $rename = [
      'error' => 'Error trying to rename file.'
    ];
  }

  return $rename;
}
?>