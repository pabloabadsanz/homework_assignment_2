/*
 * Library for managing data from Pizza-delivery REST API
 *
 */

 // Dependencies
 var fs = require('fs');
 var path = require('path');
 var helpers = require('./helpers')

 // Container for the module
 var lib = {};

// Current data folder
lib.basedir = path.join(__dirname, '../../.data/');

// Writes data to specified file
lib.write = function(folderName, fileName, data, callback) {
  // Open the file for writing
  fs.open(lib.basedir + folderName + '/' + fileName + '.json', 'wx', function(err, filedescriptor) {
    if (!err && filedescriptor) {

      // Convert data to string
      var stringdata = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(filedescriptor, stringdata, function(err) {
        if (!err) {
          fs.close(filedescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      console.log(err);
      callback('Could not create new file. It may already exist');
    }
  });
};

// Reads data from a file
lib.read = function(folderName, fileName, callback) {
  fs.readFile(lib.basedir + folderName + '/' + fileName + '.json', 'utf-8', function(err, data) {
    if (!err && data) {
      var parsedData = helpers.parseJSONtoObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Updates data inside a file
lib.update = function(folderName, fileName, data, callback) {

  // Open the file for writing
  fs.open(lib.basedir + folderName + '/' + fileName + '.json', 'r+', function(err, filedescriptor) {
    if (!err && filedescriptor) {

      // Convert data to string
      var stringdata = JSON.stringify(data);

      // Truncate the file
      fs.truncate(filedescriptor, function(err) {
        if (!err) {

          // Write to file and close it
          fs.writeFile(filedescriptor, stringdata, function(err) {
            if (!err) {
              fs.close(filedescriptor, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing the file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open the file for updating. It may not exist yet');
    }
  });
};

// Delete a file
lib.delete = function(folderName, fileName, callback) {
  // Unlink the file
  fs.unlink(lib.basedir + folderName + '/' + fileName + '.json', function(err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file');
    }
  });
};

// List all the items in a directory
lib.list = function(folderName, callback) {
    fs.readdir(lib.basedir + folderName + '/', function(err, data) {
      if (!err && data && data.length > 0) {
        var trimmedFileNames = [];
        data.forEach(function(fileName) {
          trimmedFileNames.push(fileName.replace('.json', ''));
        });
        callback(false, trimmedFileNames);
      } else {
        callback(err, data);
      }
    });
};

// Export the module
module.exports = lib;
