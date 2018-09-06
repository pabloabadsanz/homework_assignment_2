/*
 * Helpers for performing several tasks
 *
 */

// Dependencies
var crypto = require('crypto');
var config = require('../config');
var https = require('https');
var querystring = require('querystring');

 // Container for all the Helpers
 var helpers = {};

// Creates a SHA256 hash
helpers.hash = function(str) {
  if (typeof(str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingsecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parses JSON string to an object in all cases
helpers.parseJSONtoObject = function(str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
};

// Creates a string of random characters, of a given length
helpers.createRandomString = function(strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
      // Get a random character from the possibleCharacters string
      var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the final string
      str += randomChar;
    }

    return str;
  } else {
    return false;
  }
}

// Payment with stripe.com
helpers.paymentWithStripe = function(amount, callback) {

  // Build the request details object
  var req_details = {
      'protocol': 'https:',
      'method': 'POST',
      'hostname': 'api.stripe.com',
      'path': '/v1/charges',
      'auth': config.stripe.key
  };

  // Build the payload object
  var payload = {
      'amount': amount,
      'source': 'tok_visa',
      'description': 'Pablo\'s Pizza Restaurant Order',
      'currency': config.stripe.currency
  };

  var stringpayload = querystring.stringify(payload);

  // Instantiate the request
  var req = https.request(req_details, function(res) {
      var statuscode = res.statusCode;
      if(statuscode === 200 || statuscode === 201) {
        callback(false);
      } else {
        callback(statuscode);
      }
  });

  req.on('error', callback);
  req.write(stringpayload);
  req.end();

};

helpers.sendMailWithOrder = function(userData, order, callback) {

  // Build the request object
  var requestdetails = {
      protocol: 'https:',
      hostname: 'api.mailgun.net',
      method: 'POST',
      path: config.mailgun.path,
      auth: config.mailgun.key
  };

  // Build the payload object
  var payload = {
      from: config.mailgun.sender,
      to: userData.mail,
      subject: 'Your Pizza Order!',
      text: order
  };

  var stringpayload = querystring.stringify(payload);

  requestdetails.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringpayload)
  };

  // Instantiate the request.
  var req = https.request(requestdetails, function(res) {
      var status = res.statusCode;
      if(status === 200 || status === 201) {
        console.log("Mail sent out");
        callback(false);
      } else {
        callback(status);
      }
  });

  req.on('error', (err) => {
    callback(err);
  });
  req.write(stringpayload);
  req.end();
};

// Export the module
module.exports = helpers;
