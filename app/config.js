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
  'menuItemsData': {
    'Tomato': 4.5,
    'Tuna': 3.75,
    'Ham': 3.9,
    'Pepperoni': 4.8,
    'Cheese': 4,
  },
  'stripe' : {
    'key' : '',
    'currency' : 'eur'
  },
  'mailgun': {
    'key': '',
    'path': '',
    'sender': ''
  }
}


// Export the module
module.exports = environments.production;
