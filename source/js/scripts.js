// This will just kick off everything when the document is ready.
$(document).ready( function () {
  process();
});

// This function controls at a high level what needs to get run.
function process() {

  // Start by retrieving the data from Google.
  getGoogleJSON();
}

// Gets the JSON data from Google and returns an object which contains it.
function getGoogleJSON() {

  $.getJSON("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCQqdSotGRoFU331DHXZkt33jFFcB0XrdY",
  function (data) {

    // Create arrays to hold
    var category = [];
    var font = [];

    // Cycle through the returned data, building a distinct list of categories.
    $.each(data.items, function (key, val) {
      if ($.inArray(val.category, category) == "-1") {
        category.push(val.category);
      }
    });

    // Cycle through the returned data, building a complete list of fonts (with categories).
    $.each(data.items, function (key, val) {
      font.push(val.family);
    });

    // Call function to create the Category drop down.
    createCategortyDropDown(category);

    // Call function to create the Font drop down.
    createFontDropDown(font);
  });
}

function createCategortyDropDown(category) {
  // Create an empty array.
  var categoryItems = [];

  // Build the corresponding HTML elements for the category dropdown.
  $.each(category, function (key, val) {
    categoryItems.push("<option>" + val + "</option>");
  });

  // Append the contents of our array to the body.
  $("<select>", {
    "class": "category-list",
    html: categoryItems.join("")
  }).appendTo("body");
}

function createFontDropDown(font) {
  // Create an empty array.
  var fontItems = [];

  // Build the corresponding HTML elements for the category dropdown.
  $.each(font, function (key, val) {
    fontItems.push("<option>" + val + "</option>");
  });

  // Append the contents of our array to the body.
  $("<select>", {
    "class": "family-list",
    html: fontItems.join("")
  }).appendTo("body");
}
