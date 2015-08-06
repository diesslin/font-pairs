$(document).ready ->
  $('select').change ->
    selectedFont = $('select option:selected').data('font');
    #$('select').css('font-family')
    console.log selectedFont
