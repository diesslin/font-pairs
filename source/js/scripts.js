"use strict";

// This will just kick off everything when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  process();
});

// Setup Global Variables
var results = "results",
    // var targets = [ 'lorem-input', 'target-text' ];
    targets = [ 'lorem-input' ]; // Target div for font

// This function controls at a high level what needs to get run
function process() {
  // Start by retrieving the JSON data from Google.
  fetchJSONFile( 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY', function( data ){
    // Create variable for JSON object
    fontObject = data;

    // Create arrays to hold items
    var category = [],
        font = [],
        variants = [];

    // Add All Fonts category to select list
    category.push( "Select Font Category", "All Fonts" );
    
    // Cycle through the returned data, building a distinct list of categories, fonts and variants
    for ( i = 0; i < fontObject.items.length; i ++ ) {
      val = fontObject.items[i]

      // Push categories
      if ( category.indexOf( val.category ) == "-1"  ) {
        category.push( val.category );
      }

      // Push variants
      for ( v = 0; v < val.variants.length; v ++ ) {
        if ( variants.indexOf( val.variants[v] ) == "-1"  ) {
          variants.push( val.variants[v] );
        }
      }

      // Push family items
      font.push( val.family );
    }

    // Create form
    initForm( "font-form" );

    // Call function to create the Category drop down
    createDropDown( category, "category-list" );

    // Call function to create the Font drop down
    createFontDropDown( fontObject, 'family-list' );

    // Call function to create the font weights drop down
    createDropDown( variants, "variants-list", true );

    // Create text input field
    loremTextInput( "lorem-input", "family-list", "target-text" );

    // Create Add button
    addFont( "add-font" );

    // Create area for results
    targetDiv( results, "" );

    // Load font if data exists
    loadFont();

    // Populate fonts already created
    populateFont( fontsAdded );
  });
}

// Read JSON file in this case it will be getting google's font JSON
function fetchJSONFile( path, callback ) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if ( httpRequest.readyState === 4 ) {
      if ( httpRequest.status === 200 ) {
        var data = JSON.parse( httpRequest.responseText );
        if ( callback ) callback( data );
      }
    }
  };
  httpRequest.open( 'GET', path );
  httpRequest.send();
}

function initForm( formId ) {
  form = document.createElement( 'form' );
  form.id = formId;
  document.body.appendChild( form );
}

// Create select list from data
function createDropDown( data, id, disabled ) {
  // Create an empty array
  var selectItems = [];

  // Build the corresponding HTML elements for the category dropdown
  for ( i = 0; i < data.length; i ++ ) {
    selectItems.push( "<option>" + val + "</option>" );
  }

  // Append the contents of our array to the form
  selectList( id, data, false );

  // Disable list
  if ( disabled ) {
    document.getElementById( id ).disabled = disabled;
  }

  // Init change function for this item
  onChangeInit( id );

  // Set the font family to selected font
  setFont( id, targets );
}

// Create select list from font families data
function createFontDropDown( font, id ) {
  // Append the contents of our array to the form
  selectList( id, font, true );

  // Make list disabled until option is made
  document.getElementById( id ).disabled = true;

  // Init change function for this item
  onChangeInit( id );

  // Set the font family to selected font
  setFont( id, targets );
}

// Append the contents of our array to the form
function selectList( listName, array, jsonObject ) {
  // Create select list
  select = document.createElement( 'select' );
  select.id = listName;
  document.getElementById( 'font-form' ).appendChild( select );

  // Create options for select list
  var select = document.getElementById( listName );

  // Check if in JSON format or in array then loop through each properly
  if ( jsonObject ) {
    // Loop through JSON and create new options for each item in select list
    array.items.forEach( function ( val ) {
      var newItem = new Option( val.family, val.category );
      select.options[ select.options.length ] = newItem;
      newItem.dataset.name = val.family;
      newItem.dataset.variants = val.variants;
    });
  } else {
    for ( i in array ) {
      // Loop through array and add new options for each item in select list
      select.options[ select.options.length ] = new Option( array[i], array[i] );
    }
  }
}

// On change function for select lists
function onChangeInit( selectId ) {
  var stringId = "#" + selectId
  document.querySelector( stringId ).addEventListener( 'change', function() {
    // Set variables for selecting this and nextSibling
    var selected = this.value,
        neighbor = this.nextSibling,
        neighborOpts = neighbor.options;
        variants = this.options[this.selectedIndex].getAttribute('data-variants');
        fontName = this.options[this.selectedIndex].getAttribute('data-name');

    // Make sure neighbor is disabled first
    neighbor.disabled = true;

    // Loop through each item on next select list if a list exists
    if ( neighborOpts ) {
      for ( i = 0; i < neighborOpts.length; i ++ ) {
        // Make sure all options are disabled at first
        neighborOpts[i].disabled = true;
        neighborOpts[i].style.display = "none";
        neighborOpts[i].style.fontSize = 0;
        neighborOpts[i].style.fontFamily = neighborOpts[i].getAttribute("data-name");

        // Filter selected family, I made this a switch for possible ease of additions in the future
        // We hide and disable the filtered fonts just to be safe
        switch ( selected ) {
          case "All Fonts":
            neighborOpts[i].disabled = false;
            neighborOpts[i].style.display = "block";
            neighborOpts[i].style.fontSize = "100%";
            loadFontFiles( neighborOpts[i].style.fontFamily )
            break;
          case neighborOpts[i].value:
            neighborOpts[i].disabled = false;
            neighborOpts[i].style.display = "block";
            neighborOpts[i].style.fontSize = "100%";
            loadFontFiles( neighborOpts[i].style.fontFamily )
            break;
        }
      }

      // Check if this is for variants
      if ( variants ) {
        neighbor.disabled = false;
        selectedFont = variants.split(',');
        for ( i = 0; i < neighborOpts.length; i ++ ) {
          for ( s = 0; s < selectedFont.length; s ++ ) {
            if ( neighborOpts[i].value == selectedFont[s] ) {
              neighborOpts[i].disabled = false;
              neighborOpts[i].style.display = "block";
              neighborOpts[i].style.fontSize = "100%";
              loadFontFiles( fontName + ":" + selectedFont[s] );
            }
          }
        }
      }
    }

    // Enable neighbor
    neighbor.disabled = false;
  });
}

// Append input to form
function loremTextInput( inputId, fontListId, targetId ) {
  // Create input for lorem ipsum text
  var initVal = "Enter Some Text Here";
  input = document.createElement( 'input' );
  input.id = inputId;
  inputIdSelect = ( '"' + inputId + '"' )
  input.value = initVal;

  //input.disabled = 'true'; // Probably don't need this
  document.getElementById( 'font-form' ).appendChild( input );
}

// Append add button to form
function addFont( inputId, targetId ) {
  // Create input for lorem ipsum text
  input = document.createElement( 'input' );
  input.id = inputId;
  input.type = "button";
  input.value = "+";
  inputIdSelect = ( '"' + inputId + '"' )
  document.getElementById( 'font-form' ).appendChild( input );

  // Add function for adding font
  addFontFunction( inputId );
}

function targetDiv( divId, initVal ) {
  // Create select list
  var div = document.createElement( 'div' );
  div.id = divId;
  div.innerHTML = initVal;
  document.body.appendChild( div );
}

// Load Font CSS
var loadedFonts = []
function loadFontFiles( fontName ) {
  // Run if font isn't in array
  if ( isInArray( fontName, loadedFonts ) != true ) {
    // Push to array if not in it already
    loadedFonts.push( fontName )
    var headID = document.getElementsByTagName("head")[0];
    var cssNode = document.createElement('link');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    addPlus = fontName.replace(/\s+/g, "+");
    fontString = addPlus.replace(/'/g, "");

    // This switch statement is to adjust to a few of google's api quirks
    switch( fontString ) {
      case 'Buda':
        cssNode.href = String( "http://fonts.googleapis.com/css?family=" + fontString + ":300" );
        break;
      case 'Coda+Caption':
        cssNode.href = String( "http://fonts.googleapis.com/css?family=" + fontString + ":800" );
        break;
      case 'Molle':
        cssNode.href = String( "http://fonts.googleapis.com/css?family=" + fontString + ":400italic" );
        break;
      case 'Open+Sans+Condensed':
        cssNode.href = String( "http://fonts.googleapis.com/css?family=" + fontString + ":300" );
        break;
      case 'UnifrakturCook':
        cssNode.href = String( "http://fonts.googleapis.com/css?family=" + fontString + ":700" );
        break;
      case '':
        cssNode.href = String( "http://fonts.googleapis.com/css?family=" + "Exo+2" );
        break;
      default:
        cssNode.href = String( "http://fonts.googleapis.com/css?family=" + fontString );
    }

    //console.log(fontString);
    cssNode.media = 'screen';
    headID.appendChild(cssNode);
  }
}

// Checks arrays for values
function isInArray( value, array ) {
  return array.indexOf( value ) > -1;
}

// Set font to selected font
function setFont( selectedFont, targetDiv ) {
  document.getElementById( selectedFont ).addEventListener( 'change', function() {
    if ( selectedFont == "family-list" ) {
      // Get selected item
      value = this.options[this.selectedIndex].getAttribute( 'data-name' );

      // Set this fontFamily
      this.style.fontFamily = value;

      // Set font on target div
      for ( i = 0; i < targetDiv.length; i ++ ) {
        var target = document.getElementById( targetDiv[i] )
        target.style.fontFamily = value;
        target.setAttribute( 'data-name', value );
      };
    } else if ( selectedFont == "variants-list" ) {
      // Get selected item
      value = this.value;

      // Set this fontFamily
      this.style.fontWeight = value;

      // Set font on target div
      for ( i = 0; i < targetDiv.length; i ++ ) {
        var target = document.getElementById( targetDiv[i] )
        target.style.fontWeight = value;
        target.setAttribute( 'data-variants', value );
      };
    }
  });
}

function addFontFunction( inputId ) {
  var addButton = document.getElementById( inputId );
  addButton.onclick = function(){
    var userInput = this.previousSibling,
        val = userInput.value,
        fontName = userInput.getAttribute( 'data-name' );
        fontVariants = userInput.getAttribute( 'data-variants' );

    // Save entered font and value
    saveFontLocally( val, fontName, fontVariants );

    //SaveFontLocally()
    return false;
  };
}

var fontsAdded = [],
    fontsExist = JSON.parse( localStorage.getItem( 'session' ) );

// Load fonts that have already been added, also load their font file
function loadFont() {
  // Check if any fonts have been added
  if ( fontsExist ) {
    // Set fontsAdded variable to local stored fonts
    fontsAdded = JSON.parse( localStorage.getItem( 'session' ) );
    localStorage.setItem( 'session', JSON.stringify( fontsAdded ) );
    // Loop through all fonts added and load their font
    for ( var i = 0; i < fontsAdded.length; i++ ) {
      if ( fontsAdded[i].fontName ) {
        // Load font
        if ( !fontsAdded[i].variants ) {
          loadFontFiles( fontsAdded[i].fontName );
        } else if ( fontsAdded[i].variants ) {
          loadFontFiles( fontsAdded[i].fontName + ":" + fontsAdded[i].variants );
        }
      }
    }
  } else {
    // Set fontsAdded to and empty variable
    fontsAdded = [];
  }
}

// This function is used to store the font
function saveFontLocally( val, fontName, fontVariants ) {
  var arrayToPush = {};
  arrayToPush[ "value" ] = val;
  arrayToPush[ "fontName" ] = fontName;
  arrayToPush[ "fontVariants" ] = fontVariants;
  fontsAdded.push ( arrayToPush );

  // Re-serialize the array back into a string and store it in localStorage
  localStorage.setItem( 'session', JSON.stringify( fontsAdded ) );
  populateFont( fontsAdded );
  //window.localStorage.clear();
}

// Populate the fonts added
function populateFont( fontsArray ) {
  document.getElementById( results ).innerHTML = '';

  // Loop through fontsArray and create elements for each item in array
  for ( i = 0; i < fontsArray.length; i ++ ) {
    if ( fontsArray ) {
      var p = document.createElement( 'p' );
          input = document.createElement( 'input' );
      p.id = i;
      p.innerHTML = fontsArray[i].value;
      p.style.fontFamily = fontsArray[i].fontName;
      p.style.fontWeight = fontsArray[i].fontVariants;
      input.type = 'button';
      input.className = 'remove-font';
      input.value = '-';
      input.dataset.remove = i;
      document.getElementById( results ).appendChild( p );
      document.getElementById(i).appendChild( input );
    }
  }

  // Add remove font function
  removeFontButton();
}

function removeFontButton() {
  // Remove the font
  var removeButtons = document.getElementsByClassName( 'remove-font' );

  // Loop through all added fonts and add click function for removing the font
  for ( var i = 0; i < removeButtons.length; i++ ) {
    var current = removeButtons[i];
    current.addEventListener( 'click', function() {
      removeThis( this, this.getAttribute( 'data-remove' ) );
    });
  }
}

function removeThis( element, e ) {
  // Visually remove item
  element.parentNode.parentNode.removeChild( element.parentNode );

  // Remove Data for item
  if ( fontsAdded.length ) {
    fontsAdded.splice( e, 1 );
    localStorage.setItem( 'session', JSON.stringify( fontsAdded ) );
  }
}
