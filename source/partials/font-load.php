<?php
  //load font and set variables
  $json = file_get_contents('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY');
  $data = json_decode($json,true);
  $items = $data['items'];
  $allFonts = array();
  foreach ($items as $item) {
    array_push($allFonts, $item['family']);
  }
  $barDelimited = implode("|", $allFonts);
  $barDelimited = str_replace(' ','+',$barDelimited);
  $data = json_decode($json,true);
  $items = $data['items'];
  $i = 0;
  $allFonts = array();
