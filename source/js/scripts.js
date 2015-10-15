// This will just kick off everything when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  process();
});

// Setup Global Variables
var results = "results";

// This function controls at a high level what needs to get run
function process() {
  // Start by retrieving the JSON data from Google.
  fetchJSONFile( 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY', function( data ){
    // Create variable for JSON object
    fontObject = data;

    // Create arrays to hold items
    var category = [],
        font = []

    // Add All Fonts category to select list
    category.push( "Select Font Category", "All Fonts" );
    // Cycle through the returned data, building a distinct list of categories
    for ( i = 0; i < fontObject.items.length; i ++ ) {
      val = fontObject.items[i]
      if ( category.indexOf( val.category ) == "-1"  ) {
        category.push( val.category );
      }
    }

    // Cycle through the returned data, building a complete list of fonts
    for ( i = 0; i < fontObject.items.length; i ++ ) {
      val = fontObject.items[i]
      font.push( val.family );
    }

    // Create form
    initForm( "font-form" );

    // Call function to create the Category drop down
    createCategortyDropDown( category );

    // Call function to create the Font drop down
    createFontDropDown( fontObject );

    // Create text input field
    loremTextInput( "lorem-input", "family-list", "target-text" );

    // Create Add button
    addFont( "add-font" );

    // Create area for results
    targetDiv( results, "" );

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

// Create select list from Category data
function createCategortyDropDown( category ) {
  // Create an empty array
  var categoryItems = [];

  // Build the corresponding HTML elements for the category dropdown
  for ( i = 0; i < category.length; i ++ ) {
    categoryItems.push( "<option>" + val + "</option>" );
  }

  // Append the contents of our array to the form
  selectList( "category-list", category, false );

  // Init change function for this item
  onChangeInit( "category-list" );
}

// Create select list from font families data
function createFontDropDown( font ) {
  // Append the contents of our array to the form
  selectList( "family-list", font, true );

  //categoryFilter("family-list")

  // Make list disabled until option is made
  document.getElementById( "family-list" ).disabled = true;

  // Set the font family to selected font
  // var targets = [ 'lorem-input', 'target-text' ];
  var targets = [ 'lorem-input' ];
  setFont( 'family-list', targets );
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
      var newItem = new Option( val.family, val.category )
      select.options[ select.options.length ] = newItem;
      newItem.setAttribute( "data-name", val.family )
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

    neighbor.disabled = true;

    // Loop through each item on next select list
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

      // Protect default text from enabling select list and enable neighbor list
      if ( i == ( neighborOpts.length - 1 ) && !( selected == "Select Font Category" ) ) {
        console.log("loaded")
        neighbor.disabled = false;
      }
    }
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
  document.getElementById( 'font-form' ).appendChild( input );

  // Create area for target text
  //targetDiv( targetId, initVal );

  // initiate function when writing
  // document.getElementById( inputId ).addEventListener( 'keydown', function( targetId, inputId ) {
  //   value = document.getElementById( "lorem-input" ).value;
  //   document.getElementById( "target-text" ).innerHTML = value;
  // });
}

// Append add button to form
function addFont( inputId, targetId ) {
  // Create input for lorem ipsum text
  input = document.createElement( 'input' );
  input.id = inputId;
  input.type = "button";
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

// Function to write value to div
function writeText ( divId, inputId ) {
  writeId = ( "'" + inputId + "'" ).toString()
  console.log(writeId)

  // value = document.getElementById( writeId ).value();
  value = document.getElementById( "lorem-input" ).value;
  document.getElementById( divId ).innerHTML = value;
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
    cssNode.href = String( "http://fonts.googleapis.com/css?family=" + fontString );
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
    // Get selected item
    value = this.options[this.selectedIndex].getAttribute( 'data-name' )

    // Set this fontFamily
    this.style.fontFamily = value;

    // Set font on target div
    for ( i = 0; i < targetDiv.length; i ++ ) {
      var target = document.getElementById( targetDiv[i] )
      target.style.fontFamily = value;
      target.setAttribute( 'data-name', value );
    };
  });
}

function addFontFunction( inputId ) {
  var addButton = document.getElementById( inputId );
  addButton.onclick = function(){
    var userInput = this.previousSibling,
        val = userInput.value,
        fontName = userInput.getAttribute( 'data-name' );

    // Save entered font and value
    saveFontLocally( val, fontName );
    //SaveFontLocally()
    return false;
  };
}

// Create local variable and store
var fontsAdded = [];
fontsAdded.push( JSON.parse( localStorage.getItem( 'session' ) ) );
localStorage.setItem( 'session', JSON.stringify( fontsAdded ) );

// This function is used to store the font
function saveFontLocally( val, fontName ) {
  // Parse the serialized data back into an aray of objects
  fontsAdded = JSON.parse( localStorage.getItem( 'session' ) );
  // Push the new data (whether it be an object or anything else) onto the array
  var arrayToPush = {};
  arrayToPush[ "value" ] = val;
  arrayToPush[ "fontName" ] = fontName;
  fontsAdded.push ( arrayToPush );
  // Alert the array value
  //alert(fontsAdded);  // Should be something like [Object array]
  // Re-serialize the array back into a string and store it in localStorage
  localStorage.setItem( 'session', JSON.stringify( fontsAdded ) );
  console.log( fontsAdded );
  populateFont( fontsAdded );
  //console.log(localStorage.setItem('session', JSON.stringify(fontsAdded)));
  //window.localStorage.clear()
}

function populateFont( fontsArray ) {
  document.getElementById( results ).innerHTML = '';
  for ( i = 0; i < fontsArray.length; i ++ ) {
    if ( fontsArray[i].value ) {
      var p = document.createElement( 'p' );
          input = document.createElement( 'input' );
      p.id = i;
      p.innerHTML = fontsArray[i].value;
      p.style.fontFamily = fontsArray[i].fontName;
      input.type = 'button';
      input.value = '-';
      document.getElementById( results ).appendChild( p );
      document.getElementById( i ).appendChild( input );
    }
  }
}
