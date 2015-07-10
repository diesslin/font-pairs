<!DOCTYPE html>
<head>
  <?php
  $json = file_get_contents('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY');
  $data = json_decode($json,true);
  $items = $data['items'];
  $allFonts = array();
  foreach ($items as $item) {
    array_push($allFonts, $item['family']);
  }
  $barDelimited = implode("|", $allFonts);
  $barDelimited = str_replace(' ','+',$barDelimited);
  ?>
  <link href='http://fonts.googleapis.com/css?family=<?php echo $barDelimited; ?>' rel='stylesheet' type='text/css'>
</head>
<body>
  <?php
  $json = file_get_contents('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY');
  $data = json_decode($json,true);
  $items = $data['items'];
  $i = 0;
  $allFonts = array();
  echo '<select>';
  foreach ($items as $item) {
    $i++;
    $str = 'Font '.$i.' '.$item['family'].' Subsets:';
    foreach ($item['variants'] as $variant) {
      $str .= ' '.$variant.' ';
    }
    $str.= ' Variants';
    foreach ($item['subsets'] as $subset) {
      $str .= ' '.$subset;
    }
    //echo $str.'<br />';
    //echo "<h2 style=\"font-family: ".$item["family"].','.$item["category"]."\">".$item["family"].'</h2>';
    //echo $item['family'].'|';
    array_push($allFonts, $item['family']);
    echo "<option style=\"font-family: ".$item["family"].','.$item["category"]."\">".$item["family"].'</option>';
  }
  echo '</select>';
  //$barDelimited = implode("|", $allFonts);
  //echo $barDelimited;
  ?>
</body>
</html>
