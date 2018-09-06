/*
 * Primary file for the Pizza-delivery API
 *
 */

 // Dependencies
var server = require('./lib/server');
var tokensWorker = require('./lib/tokens_worker');

// Declare the application
var app = {};

// Initialize the service
app.init = function() {

  // Start the server
  server.init();

  // Start the tokens worker
  tokensWorker.init();
};

// Execute the app
app.init();

// Export the application
module.exports = app;
