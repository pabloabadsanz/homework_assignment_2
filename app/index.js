/*
 * Primary file for the Pizza-delivery API
 *
 */

 // Dependencies
var server = require('./lib/server');

// Declare the application
var app = {};

// Initialize the service
app.init = function() {

  // Start the server
  server.init();
};

// Execute the app
app.init();

// Export the application
module.exports = app;
