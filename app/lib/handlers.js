/*
 * Request handlers
 *
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('../config');

// Define the handlers object
var handlers = {};

// Users handler
handlers.users = function(data, callback) {
  var acceptablemethods = ['post', 'get', 'put', 'delete'];
  if (acceptablemethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - POST
// Required data: username, name, mail, address, password
// Optional data: none
handlers._users.post = function(data, callback) {
  // Check that all required fields are filled out
  var username = typeof(data.payload.username) == 'string' && data.payload.username.trim().length > 0 ? data.payload.username.trim() : false;
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var mail = typeof(data.payload.mail) == 'string' && data.payload.mail.trim().length > 0 && data.payload.mail.trim().indexOf('@') > -1 && data.payload.mail.trim().indexOf('.') > -1 && data.payload.mail.trim().indexOf('@') < data.payload.mail.trim().indexOf('.') - 1 ? data.payload.mail.trim() : false;
  var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (username && name && mail && address && password) {

    // Check whether the user exists
    _data.read('users', username, function(err, data) {
      if (err) {
        // Hash the password
        var hashedpassword = helpers.hash(password);

        // Create the user object
        if (hashedpassword) {
          var userobject = {
            'username': username,
            'name': name,
            'mail': mail,
            'address': address,
            'hashedPassword': hashedpassword
          };

          // Store the user
          _data.write('users', username, userobject, function(err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not create the new user'});
            }
          });
        } else {
          callback(500, {'Error': 'Could not has the user\'s password'});
        }

      } else {
        // User already exists
        callback(400, {'Error': 'A user with that name already exists'})
      }
    });
  } else {
    callback(400, {'Error': 'Missing required fields'});
  }
};

// Users - GET
// Required data: username
// Optional data: none
handlers._users.get = function(data, callback) {
  // Check that the username is valid
  var username = typeof(data.queryStringObject.username) == 'string' && data.queryStringObject.username.trim().length > 0 ? data.queryStringObject.username.trim() : false;
  if (username) {
    // Get the token from the headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the username
    handlers._tokens.verirytoken(token, username, function(tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', username, function(err, data) {
          if (!err && data) {
            // Remove hashed password from user object before returning it
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {'Error': 'Missing required token in header, or token is invalid'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
};

// Users - PUT
// Required data: username
// Optional data: name, mail, address, password (at least one must be specified)
handlers._users.put = function(data, callback) {
  // Check for the required field
  var username = typeof(data.payload.username) == 'string' && data.payload.username.trim().length > 0 ? data.payload.username.trim() : false;

  // Check for the optional fields
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var mail = typeof(data.payload.mail) == 'string' && data.payload.mail.trim().length > 0 && data.payload.mail.trim().indexOf('@') > -1 && data.payload.mail.trim().indexOf('.') > -1 && data.payload.mail.trim().indexOf('@') < data.payload.mail.trim().indexOf('.') - 1 ? data.payload.lastName.trim() : false;
  var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if username is invalid
  if (username) {
    if (name || mail || address || password) {
      // Get the token from the headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
      // Verify that the given token is valid for the username
      handlers._tokens.verirytoken(token, username, function(tokenIsValid) {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', username, function(err, userData) {
            if (!err && userData) {
              // Update the fields necessary
              if (name) {
                userData.name = name;
              }
              if (mail) {
                userData.mail = mail;
              }
              if (address) {
                userData.address = address;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              // Store the new updates
              _data.update('users', username, userData, function(err) {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, {'Error': 'Could not update user'});
                }
              });
            } else {
              callback(400, {'Error': 'The specified user does not exist'});
            }
          });
        } else {
          callback(403, {'Error': 'Missing required token in header, or token is invalid'});
        }
      });
    } else {
      callback(400, {'Error': 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
};

// Users - DELETE
// Required data: username
handlers._users.delete = function(data, callback) {
  // Check that the username is valid
  var username = typeof(data.queryStringObject.username) == 'string' && data.queryStringObject.username.trim().length > 0 ? data.queryStringObject.username.trim() : false;
  if (username) {
    // Get the token from the headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the username
    handlers._tokens.verirytoken(token, username, function(tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', username, function(err, data) {
          if (!err && data) {
            _data.delete('users', username, function(err) {
              if (!err) {
                // Delete each of the tokens associated with the user
                var usertokens = typeof(data.tokens) == 'object' && data.tokens instanceof Array ? data.tokens : [];
                var tokenstodelete = usertokens.length;
                if (tokenstodelete > 0) {
                  var tokensdeleted = 0;
                  var deletionErrors = false;
                  // Loop through the tokens
                  usertokens.forEach(function(tokenId) {

                    // Delete the token
                    _data.delete('tokens', tokenId, function(err) {
                      if (err) {
                        deletionErrors = true;
                      }
                      tokensdeleted++;
                      if(tokensdeleted == tokenstodelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, {'Error': 'Errors encountered while attempting to delete all of the user\'s tokens. All checks may not have deleted from the system successfully'});
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, {'Error': 'Could not delete the specified user'});
              }
            });
          } else {
            callback(400, {'Error': 'Could not find the specified user'});
          }
        });
      } else {
        callback(403, {'Error': 'Missing required token in header, or token is invalid'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
};

// Tokens
handlers.tokens = function(data, callback) {
  var acceptablemethods = ['post', 'get', 'put', 'delete'];
  if (acceptablemethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - POST
// Required data: username, password
// Optional data: none
handlers._tokens.post = function(data, callback) {
  var username = typeof(data.payload.username) == 'string' && data.payload.username.trim().length > 0 ? data.payload.username.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (username && password) {
    // Lookup the user who matches that username
    _data.read('users', username, function(err, userData) {
      if (!err && userData) {
        var usertokens = typeof(userData.tokens) == 'object' && userData.tokens instanceof Array ? userData.tokens : [];

        // Hash the sent password, and compare it to the stored password
        var hashedpassword = helpers.hash(password);
        if (hashedpassword == userData.hashedPassword) {
          // If valid, create a new token with a random name. Set expiration date 1 hour in the future
          var tokenid = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;

          var tokenobject = {
            'username': username,
            'id': tokenid,
            'expires': expires
          };

          // Store the token
          _data.write('tokens', tokenid, tokenobject, function(err) {
            if (!err) {
              // Add the token id to the user's object
              userData.tokens = usertokens;
              userData.tokens.push(tokenid);

              // Save the token into user data
              _data.update('users', username, userData, function(err) {
                if (!err) {
                  // Return the data about the new token
                  callback(200, tokenobject);
                } else {
                  callback(500, {'Error': 'Could not update the user with the new token'});
                }
              });
            } else {
              callback(500, {'Error': 'Could not create the new token'});
            }
          });
        } else {
          callback(400, {'Error': 'Password did not match the specified user\'s stored password'});
        }
      } else {
        callback(400, {'Error': 'Could not find the specified user'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required fields'});
  }
}

// Tokens - GET
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback) {
  // Check that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
}

// Tokens - PUT
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data, callback) {
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if (id && extend) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure the token is not already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the updated token
          _data.update('tokens', id, tokenData, function(err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not update the token\'s expiration'});
            }
          });
        } else {
          callback(400, {'Error': 'Token already expired. Cannot be expired'});
        }
      } else {
        callback(400, {'Error': 'specified token does not exist'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field(s) or field(s) are invalid'});
  }
}

// Tokens - DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback) {
  // Check that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the token
    _data.read('tokens', id, function(err, data) {
      if (!err && data) {
        _data.delete('tokens', id, function(err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, {'Error': 'Could not delete the specified token'});
          }
        });
      } else {
        callback(400, {'Error': 'Could not find the specified token'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verirytoken = function(id, username, callback) {
  // Lookup the token
  _data.read('tokens', id, function(err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.username == username && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Login
handlers.login = function(data, callback) {
  var acceptablemethods = ['post'];
  if (acceptablemethods.indexOf(data.method) > -1) {
    handlers._login[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the login methods
handlers._login = {};

// Login - POST
// Required data: username, password
handlers._login.post = function(data, callback) {

  // Check for the required fields
  var username = typeof(data.payload.username) == 'string' && data.payload.username.trim().length > 0 ? data.payload.username.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // If reqired fields are valid
  if (username && password) {
    // Forward the request to the tokens handler
    handlers._tokens.post(data, function(statuscode, msg) {
      callback(statuscode, msg);
    });
  } else {
    callback(400, {'Error': 'Missing required fields, or invalid'});
  }
};

// Logout
handlers.logout = function(data, callback) {
  var acceptablemethods = ['post'];
  if (acceptablemethods.indexOf(data.method) > -1) {
    handlers._logout[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the logout methods
handlers._logout = {};

// Logout - POST
// Required data: username, password, tokenId
handlers._logout.post = function(data, callback) {
  // Check for the required fields
  var username = typeof(data.payload.username) == 'string' && data.payload.username.trim().length > 0 ? data.payload.username.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tokenid = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

  // If reqired fields are valid
  if (username && password && tokenid) {
    // Get the token from the headers

    // Verify that the given token is valid for the username
    handlers._tokens.verirytoken(tokenid, username, function(tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', username, function(err, userData) {
          if (!err && userData) {
            // Lookup the token
            _data.read('tokens', tokenid, function(err, data) {
              if (!err && data) {
                _data.delete('tokens', tokenid, function(err) {
                  if (!err) {
                    // Retrieve the tokens from the user object
                    var usertokens = typeof(userData.tokens) == 'object' && userData.tokens instanceof Array ? userData.tokens : [];

                    // Remove the token id from the user's object
                    var checkposition = usertokens.indexOf(tokenid);
                    userData.tokens.splice(checkposition, 1);

                    // Save the token into user data
                    _data.update('users', username, userData, function(err) {
                      if (!err) {
                        // Return the data about the new token
                        callback(200);
                      } else {
                        callback(500, {'Error': 'Could not update the user with the new token'});
                      }
                    });
                  } else {
                    callback(500, {'Error': 'Could not delete the specified token'});
                  }
                });
              } else {
                callback(400, {'Error': 'Could not find the specified token'});
              }
            });
          } else {
            callback(400, {'Error': 'The specified user does not exist'});
          }
        });
      } else {
        callback(403, {'Error': 'Missing required token in header, or token is invalid'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required fields, or invalid'});
  }
};

// The not found handler
handlers.notFound = function(data,callback){
  callback(404);
};

// Export the module
module.exports = handlers
