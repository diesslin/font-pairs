<?php
  //load font and set variables
  include "partials/font-load";
?>
<!DOCTYPE html>
<head>
  <link href='http://fonts.googleapis.com/css?family=<?php echo $barDelimited; ?>' rel='stylesheet' type='text/css'>
</head>
<body>
  <form>
    <select>
      <?php
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
          array_push($allFonts, $item['family']);
          echo "<option style=\"font-family: ".$item["family"].','.$item["category"]."\">".$item["family"].'</option>';
        }
      ?>
    </select>
    <input type="textarea" class="font-1-text" placeholder="Font 1 Text" value"green"></input>
  </form>
</body>
</html>
