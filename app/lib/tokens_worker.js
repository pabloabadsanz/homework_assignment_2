/*
 * Tokens workers related tasks
 *
 */

// Dependencies
var fs = require('fs');
var _data = require('./data');
var helpers = require('./helpers');
var util = require('util');

// Instantiate the worker object
var tokenWorker = {};

// Lookup all the tokens, get their data, send to a validator to check their expiration date
tokenWorker.gatherAllTokens = function() {
  // Get all the tokens
  _data.list('tokens', function(err, tokens) {
    if (!err && tokens && tokens.length > 0) {
      tokens.forEach(function(token) {
        // Read in the token data
        _data.read('tokens', token, function(err, originalTokenData) {
          if (!err && originalTokenData) {
            // Pass the data to the token validator, and let that function continue or log errors as needed
            tokenWorker.validateTokenExpirationDate(originalTokenData);
          } else {
            console.log("Error reading one of the token's data");
          }
        });
      });
    }
  });
};

// Validate if the token is expired
tokenWorker.validateTokenExpirationDate = function(originalTokenData, callback) {
  originalTokenData = typeof(originalTokenData) == 'object' && originalTokenData !== null ? originalTokenData : [];
  originalTokenData.expires = typeof(originalTokenData.expires) == 'number' && originalTokenData.expires % 1 === 0 && originalTokenData.expires >= 1 && originalTokenData.expires > Date.now() ? originalTokenData.expires : false;
  originalTokenData.id = typeof(originalTokenData.id) == 'string' && originalTokenData.id.trim().length == 20 ? originalTokenData.id.trim() : false;

  // If the token is expired, remove it
  if (!originalTokenData.expires) {
    _data.delete('tokens', originalTokenData.id, function(err) {
      if (!err) {
        // Lookup the user
        _data.read('users', originalTokenData.username, function(err, userData) {
          // Retrieve the tokens from the user object
          var usertokens = typeof(userData.tokens) == 'object' && userData.tokens instanceof Array ? userData.tokens : [];

          // Remove the token id from the user's object
          var tokenposition = usertokens.indexOf(originalTokenData.id);
          userData.tokens.splice(tokenposition, 1);

          // Save the user data
          _data.update('users', originalTokenData.username, userData, function(err) {
            if (!err) {
              console.log("Removed expired token " + originalTokenData.id);
            } else {
              console.log("Could not delete the specified token from the user" + originalTokenData.id);
            }
        });
      });
      } else {
        console.log("Could not delete the specified token" + originalTokenData.id);
      }
    });
  }
};


// Timer to execute the log rotation process once per day
tokenWorker.loop = function() {
  setInterval(function() {
    tokenWorker.gatherAllTokens();
  }, 1000 * 5);
}

// Init script
tokenWorker.init = function() {

  // Send to console, in yellow
  console.log('\x1b[33m%s\x1b[0m', 'Token worker is running');

  // Check and remove all expired tokens
  tokenWorker.gatherAllTokens();

  // Call the loop so the tokens are checked later on
  tokenWorker.loop();

};

 // Export the module
 module.exports = tokenWorker;
