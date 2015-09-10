// This will just kick off everything when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  process();
});

// This function controls at a high level what needs to get run
function process() {
  // Start by retrieving the JSON data from Google.
  fontObject = JSON.parse( readJSON( 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY' ) );

  // Create arrays to hold items
  var category = [];
  var font = [];

  // Add All Fonts category to select list
  category.push( "Select Font Category", "All Fonts" );
  // Cycle through the returned data, building a distinct list of categories
  fontObject.items.forEach( function ( val ) {
    // Check if value exists in array or not, this is not supported in IE8
    if ( category.indexOf( val.category ) == "-1"  ) {
      category.push( val.category );
    }
  });

  // Cycle through the returned data, building a complete list of fonts (with categories)
  fontObject.items.forEach( function ( val ) {
    font.push( val.family );
  });

  // Call function to create the Category drop down
  createCategortyDropDown( category );

  // Call function to create the Font drop down
  //createFontDropDown( font );
  createFontDropDown( fontObject );
}

// Read JSON file in this case it will be getting google's font JSON
function readJSON( file ) {
  var request = new XMLHttpRequest();
  request.open( 'GET', file, false );
  request.send( null );
  if ( request.status == 200 )
    return request.responseText;
};

// Create select list from Category data
function createCategortyDropDown( category ) {
  // Create an empty array
  var categoryItems = [];

  // Build the corresponding HTML elements for the category dropdown
  category.forEach( function ( val ) {
    categoryItems.push( "<option>" + val + "</option>" );
  });

  // Append the contents of our array to the body
  selectList( "category-list", category );
}

// Create select list from font families data
function createFontDropDown( font ) {
  // Append the contents of our array to the body
  selectList( "family-list", font, true );
  document.getElementById("family-list").disabled = true;
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
