/*
 * Create configuration variables
 *
 */

// Container
var environments = {};

environments.production = {
  'httpPort' : 1234,
  'envName' : 'production',
  'hashingsecret': 'thisIsASecret',
  'stripe' : {
    'key' : '',
    'currency' : 'eur'
  }
}

// Export the module
module.exports = environments.production;
