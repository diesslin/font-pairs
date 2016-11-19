"use strict";

// This will just kick off everything when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  process();
});

// Setup Global Variables
var targets = [ 'lorem-input', 'variants-list', 'category-list' ]; // Target div for font

// This function controls at a high level what needs to get run
function process() {
  // Start by retrieving the JSON data from Google.
  fetchJSONFile( 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY', function( data ){
    // Create variable for JSON object
    var fontObject = data;

    // Create arrays to hold items
    var category = [],
        font = [],
        variants = [];

    // Add All Fonts category to select list
    category.push( "Select Font Category", "All Fonts" );

    // Cycle through the returned data, building a distinct list of categories, fonts and variants
    for ( var i = 0; i < fontObject.items.length; i ++ ) {
      var val = fontObject.items[i]

      // Push categories
      if ( category.indexOf( val.category ) == "-1"  ) {
        category.push( val.category );
      }

      // Push variants
      for ( var v = 0; v < val.variants.length; v ++ ) {
        if ( variants.indexOf( val.variants[v] ) == "-1"  ) {
          variants.push( val.variants[v] );
        }
      }

      // Push family items
      font.push( val.family );
    }

    // Create area for background fonts, this needs to be before the font family's are loaded
    targetDiv( '', 'background-fonts', '' );

    // Load page families for actual website styling
    loadFontFiles( ['Vollkorn', 'Lato'] );

    // Create form
    initForm( 'font-form', 'form' );

    // Call function to create the Category drop down
    createDropDown( category, 'category-list', 'select', false, 'family-list' );

    // Call function to create the Font drop down
    createFontDropDown( fontObject, 'family-list', 'select', 'variants-list' );

    // Call function to create the font weights drop down
    createDropDown( variants, 'variants-list', 'select', true, false );

    // Create text input field
    generalInput( 'lorem-input', 'text-area', "Enter Some Text Here", 'textarea' );

    // Create font-size input
    //generalInput( 'font-size', 'input', '1', 'input' );

    // Create line-height input
    //generalInput( 'line-height', 'input', '1', 'input' );

    // Create remove fonts button
    addButton( 'remove-font', 'action-button', 'font-form', 'remove', 'results' );

    // Create Add button
    addButton( 'add-font', 'action-button', 'font-form', 'add' );

    // Create area for results
    targetDiv( 'results', 'results', '' );

    // Load font if data exists
    loadFont();

    // Populate fonts already created
    populateFont( fontsAdded );

    // Run through fonts and start adding them in the background
    //loadTimer( fontObject, fontsAdded );
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

function initForm( formId, formClass ) {
  var form = document.createElement( 'form' );
  form.id = formId;
  form.className = formClass;
  document.body.appendChild( form );
}

// Create select list from data
function createDropDown( data, id, elementClass, disabled, siblingElement ) {
  // Create an empty array
  var selectItems = [];

  // Build the corresponding HTML elements for the category dropdown
  for ( var i = 0; i < data.length; i ++ ) {
    selectItems.push( "<option>" + data[i] + "</option>" );
  }

  // Append the contents of our array to the form
  selectList( id, data, elementClass, false );

  // Disable list
  if ( disabled ) {
    document.getElementById( id ).disabled = disabled;
  }

  // Init change function for this item
  onChangeInit( id, siblingElement );

  // Set the font family to selected font
  setFont( id, targets );
}

// Create select list from font families data
function createFontDropDown( font, id, elementClass, siblingElement ) {
  // Append the contents of our array to the form
  selectList( id, font, elementClass, true );

  // Make list disabled until option is made
  document.getElementById( id ).disabled = true;

  // Init change function for this item
  onChangeInit( id, siblingElement );

  // Set the font family to selected font
  setFont( id, targets );
}

// Append the contents of our array to the form
function selectList( listName, array, selectClass, jsonObject ) {
  // Create select list
  select = document.createElement( 'select' );
  select.id = listName;
  select.className = selectClass;
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
    for ( var i in array ) {
      // Loop through array and add new options for each item in select list
      select.options[ select.options.length ] = new Option( array[i], array[i] );
    }
  }
}

// On change function for select lists
function onChangeInit( selectId, siblingElement ) {
  var stringId = "#" + selectId
  document.querySelector( stringId ).addEventListener( 'change', function() {
    // Set variables for selecting this and nextSibling
    var selected = this.value,
        neighbor = document.getElementById(siblingElement), 
        neighborOpts = neighbor.options,
        variants = this.options[this.selectedIndex].getAttribute('data-variants'),
        fontName = this.options[this.selectedIndex].getAttribute('data-name');

    // Make sure neighbor is disabled first
    neighbor.disabled = true;

    // Loop through each item on next select list if a list exists
    if ( neighborOpts ) {
      for ( var i = 0; i < neighborOpts.length; i ++ ) {
        // Make sure all options are disabled at first
        neighborOpts[i].disabled = true;
        neighborOpts[i].hidden = true;
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
        var selectedFont = variants.split(',');
        neighbor.disabled = false;
        for ( var i = 0; i < neighborOpts.length; i ++ ) {
          if ( selectedFont.indexOf(neighborOpts[i].value) > -1 ) {             
            // Set variables for checking weight
            var weight = neighborOpts[i].value,
                italic = false;

            // Set styles for each item
            // split weight text if italic is in it and set italic style
            if ( weight.indexOf( 'italic' ) > -1 ) {
              weight = weight.replace( 'italic', '' );
              italic = true;
              neighborOpts[i].style.fontWeight = weight;
              neighborOpts[i].style.fontStyle = 'italic';
            } else {
              neighborOpts[i].style.fontWeight = weight;
            }

            neighborOpts[i].disabled = false;
            neighborOpts[i].style.display = "block";
            neighborOpts[i].style.fontSize = "100%";
            loadFontFiles( fontName + ":" + weight );
          }
        }
      }
    }

    // Enable neighbor
    neighbor.disabled = false;
  });
}

// Append input to form
function generalInput( inputId, inputClass, initVal, elementType, targetId ) {
  // Create input
  var textarea = document.createElement( elementType ),    
      inputIdSelect = ( '"' + inputId + '"' );
  textarea.id = inputId;
  textarea.className = inputClass;
  textarea.value = initVal;
  document.getElementById( 'font-form' ).appendChild( textarea );

  // initiate function when writing if target is set
  if ( targetId ) {
    document.getElementById( inputId ).addEventListener( 'keydown', function( targetId, inputId ) {
      value = document.getElementById( "lorem-input" ).value;
      document.getElementById( "target-text" ).innerHTML = value;
    });
  }
}

// Append add button to form
function addButton( inputId, inputClass, targetId, buttonFunction, targetElement ) {
  // Create buttons
  var input = document.createElement( 'input' ),
      inputIdSelect = ( '"' + inputId + '"' );
  input.id = inputId;
  input.className = inputClass;
  input.type = "button";
  input.value = ( buttonFunction == 'add' ? '+' : '-' ); // Check if button is for adding
  document.getElementById( targetId ).appendChild( input );

  // Add function for adding font
  if ( buttonFunction == 'add' ) {
    addFontFunction( inputId );
  } else if ( buttonFunction == 'remove' ) {
    removeFonts( inputId, targetElement );
  }
}

function targetDiv( divId, divClass, initVal ) {
  // Create select list
  var div = document.createElement( 'div' );
  div.id = divId;
  div.className = divClass;
  div.innerHTML = initVal;
  document.body.appendChild( div );
}

// Load Font CSS
var loadedFonts = []
function loadFontFiles( fontName ) {
  // Check if is array or not
  if ( !Array.isArray( fontName ) ) {
    fontName = [fontName];
  }

  // Set variable for backgroud font append group and target to append group
  var allBackgroundFonts = document.createDocumentFragment(),
      documentBody = document.getElementsByClassName( 'background-fonts' )[0];

  // Loop through each font sent in
  for ( var f = 0; f < fontName.length; f ++ ) {
    // Run if font isn't in array
    if ( isInArray( fontName[f], loadedFonts ) != true ) {
      // Push to array if not in it already
      loadedFonts.push( fontName[f] )
     
      var p = document.createElement( 'p' );
      p.className = 'background-fonts__font';
      p.innerHTML = fontName[f];
      p.style.fontFamily = fontName[f];
      allBackgroundFonts.appendChild( p );

      var headID = document.getElementsByTagName("head")[0],
          cssNode = document.createElement('link'),
          fontString = fontName[f].replace(/\s+/g, "+").replace(/'/g, "").replace(/"/g, "");
      cssNode.type = 'text/css';
      cssNode.rel = 'stylesheet';

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

      cssNode.media = 'screen';
      headID.appendChild(cssNode);
    }
  }

  // Append group of background fonts
  documentBody.appendChild(allBackgroundFonts);
  // TODO: See if there's a way to disable font list until all fonts are rendered
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
      var value = this.options[this.selectedIndex].getAttribute( 'data-name' );

      // Set this fontFamily
      this.style.fontFamily = value;

      // Set font on target div
      for ( var i = 0; i < targetDiv.length; i ++ ) {
        var target = document.getElementById( targetDiv[i] )
        target.style.fontFamily = value;
        target.setAttribute( 'data-name', value );
      };
    } else if ( selectedFont == "variants-list" ) {
      // Get selected item
      var value = this.value;

      // Set font weight after removing italic from string
      if (( value.indexOf("italic") > -1 )) {
        var weight = value.replace( "italic","" ),
            italics = true;
        this.style.fontStyle = "italic";
      } else {
        var weight = value,
            italics = false;
        this.style.fontStyle = "normal";
      }

      // Set this fontFamily
      this.style.fontWeight = weight;

      // Set font weight on target div
      for ( var i = 0; i < targetDiv.length; i ++ ) {
        // Find all target items and set their values
        var target = document.getElementById( targetDiv[i] );
        target.style.fontWeight = weight;
        target.setAttribute( 'data-variants', weight );

        // If italics in name then set it
        if ( italics ) {
          target.style.fontStyle = "italic";
          target.setAttribute( 'data-italic', "italic" );
        } else {
          target.style.fontStyle = "normal";
          target.setAttribute( 'data-italic', "" );
        }
      };
    }
  });
}

function addFontFunction( inputId ) {
  var addButton = document.getElementById( inputId );
  addButton.onclick = function(){
    var userInput = document.getElementById( 'lorem-input' ),
        val = userInput.value.replace(/\n/g, '<br/>'),
        fontName = userInput.getAttribute( 'data-name' ),
        fontVariants = userInput.getAttribute( 'data-variants' ),
        italic = userInput.getAttribute( 'data-italic' ),
        fontSize = document.getElementById( 'font-size' ),
        lineHeight = document.getElementById( 'line-height' );

    // Save entered font and value
    saveFontLocally( val, fontName, fontVariants, italic, fontSize, lineHeight );

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

// This function runs through the google fonts array and starts loading the fonts in
function loadTimer( fontArray, addedArray ) {
  console.log(fontArray);
  console.log(addedArray);
  var fontObject = fontArray;

  
  setInterval( 'lazyLoadFonts( fontObject, fontsAdded )', 500 );
  // Run through array and check for unloaded fonts then load one
  function lazyLoadFonts( fontObject, fontsAdded ) {
    for ( var i = 0; i < fontObject.items.length; i ++ ) {
      val = fontObject.items[i]
  
      if (!fontsExist) {
        // Push categories
        if ( category.indexOf( val.category ) == "-1"  ) {
          category.push( val.category );
        }
  
        // Push variants
        for ( var v = 0; v < val.variants.length; v ++ ) {
          if ( variants.indexOf( val.variants[v] ) == "-1"  ) {
            variants.push( val.variants[v] );
          }
        }
      } else {
        return;
      }
    }
  }
}

// This function is used to store the font
function saveFontLocally( val, fontName, fontVariants, italics, fontSize, lineHeight ) {
  var arrayToPush = {};
  arrayToPush[ "value" ] = val;
  arrayToPush[ "fontName" ] = fontName;
  arrayToPush[ "fontVariants" ] = fontVariants;
  arrayToPush[ "italics" ] = italics;
  arrayToPush[ "fontSize" ] = fontSize;
  arrayToPush[ "lineHeight" ] = lineHeight;
  fontsAdded.push ( arrayToPush );

  // Re-serialize the array back into a string and store it in localStorage
  localStorage.setItem( 'session', JSON.stringify( fontsAdded ) );
  populateFont( fontsAdded );
  //window.localStorage.clear();
}

// Populate the fonts added
function populateFont( fontsArray ) {
  var resultsContainer = document.getElementById( 'results' )
  resultsContainer.innerHTML = '';

  // Loop through fontsArray and create elements for each item in array
  for ( var i = 0; i < fontsArray.length; i ++ ) {
    if ( fontsArray ) {
      var p = document.createElement( 'p' ),
          input = document.createElement( 'input' );
      p.id = i;
      p.className = 'added-font';
      p.innerHTML = fontsArray[i].value;
      p.style.fontSize = fontsArray[i].fontSize;
      p.style.lineHeight = fontsArray[i].lineHeight;
      p.style.fontFamily = fontsArray[i].fontName;
      p.style.fontWeight = fontsArray[i].fontVariants;
      p.style.fontStyle = fontsArray[i].italics;
      input.type = 'button';
      input.className = 'remove-font';
      input.value = '-';
      input.dataset.remove = i;

      // Check if there is a child item to append before or else append a child
      if ( resultsContainer.childNodes[0] != undefined ) {
        resultsContainer.insertBefore( p, resultsContainer.childNodes[0] );
      } else {
        resultsContainer.appendChild( p );
      }

      // Append remove button to element
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

// Remove this whatever it is
function removeThis( element, e ) {
  // Visually remove item
  element.parentNode.parentNode.removeChild( element.parentNode );

  // Remove Data for item
  if ( fontsAdded.length ) {
    fontsAdded.splice( e, 1 );
    localStorage.setItem( 'session', JSON.stringify( fontsAdded ) );
  }
}

// This function clears all fonts
function removeFonts( inputId, targetId ) {
  //window.localStorage.clear();
  var addButton = document.getElementById( inputId );

  // When clicked clear data and items
  addButton.onclick = function(){
    document.getElementById( targetId ).innerHTML = '';
    fontsAdded = [];
    window.localStorage.clear();
  }
}
