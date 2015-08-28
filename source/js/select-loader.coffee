$(document).ready ->
  $('select').change ->
    selectedFont = $('select option:selected').data('font');
    $(this).css('font-family', selectedFont)
    $('.font-1-text').css('font-family', selectedFont)
    console.log selectedFont
