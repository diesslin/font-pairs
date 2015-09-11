// This will just kick off everything when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  process();
});

// This function controls at a high level what needs to get run
function process() {
  // Start by retrieving the JSON data from Google.
  fetchJSONFile( 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY', function( data ){
    // Create variable for JSON object
    fontObject = data;

    // Create arrays to hold items
    var category = [];
    var font = [];

    // Add All Fonts category to select list
    category.push( "Select Font Category", "All Fonts" );
    // Cycle through the returned data, building a distinct list of categories

    for ( i = 0; i < fontObject.items.length; i ++ ) {
      val = fontObject.items[i]
      if ( category.indexOf( val.category ) == "-1"  ) {
        category.push( val.category );
      }
    };

    // Cycle through the returned data, building a complete list of fonts (with categories)
    for ( i = 0; i < fontObject.items.length; i ++ ) {
      val = fontObject.items[i]
      font.push( val.family );
    };

    // Call function to create the Category drop down
    createCategortyDropDown( category );

    // Call function to create the Font drop down
    createFontDropDown( fontObject );
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

// Create select list from Category data
function createCategortyDropDown( category ) {
  // Create an empty array
  var categoryItems = [];

  // Build the corresponding HTML elements for the category dropdown
  for ( i = 0; i < category.length; i ++ ) {
    categoryItems.push( "<option>" + val + "</option>" );
  };

  // Append the contents of our array to the body
  selectList( "category-list", category, false );

  onChangeInit( "category-list" );
}

// Create select list from font families data
function createFontDropDown( font ) {
  // Append the contents of our array to the body
  selectList( "family-list", font, true );

  //categoryFilter("family-list")

  // Make list disabled until option is made
  document.getElementById( "family-list" ).disabled = true;
}

// Append the contents of our array to the body
function selectList( listName, array, jsonObject ) {
  // Create select list
  select = document.createElement( 'select' );
  select.id = listName;
  document.body.appendChild( select );

  // Create options for select list
  var select = document.getElementById( listName );

  // Check if in JSON format or in array then loop through each properly
  if ( jsonObject ) {
    // Loop through JSON and create new options for each item in select list
    array.items.forEach( function ( val ) {
      select.options[ select.options.length ] = new Option( val.family, val.category );
    });
  } else {
    for ( i in array ) {
      // Loop through array and add new options for each item in select list
      select.options[ select.options.length ] = new Option( array[i], array[i] );
    }
  }
}

// Filter dropdown by selected category
function categoryFilter( selectId ) {
  var e = document.getElementById(selectId);
  var strUser = e.options[e.selectedIndex].value;
  console.log(strUser)
}

// On change function for select lists
function onChangeInit( selectId ) {
  var stringId = "#" + selectId
  document.querySelector( stringId ).addEventListener( 'change', function() {
    console.log(this.value)
  });
}
