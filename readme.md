The Pizza Restaurant's REST API consists on:

A users API where users can be create providing their username (primary key), name, mail address, home address, and a password
When a user logs in, a token is created, and its id is added to an array object inside the user object. The expiration date is one hour.
A user can log in more than once.
When a user logs out, the token is deleted, and removed from the array object.

I've also added a worker which checks every hour for expired tokens. When an expired token is found, it's removed from the tokens list and from the user's array object of token ids.

Regarding the menu items. I've hardcoded it in the config file, having a key pair with the menu item name and its price.

By means of the cart API menu items can be added to a cart, posting them as an array object with the name of the items in the payload. Every time a menu item is added to the cart, it is added to the cart array object inside the user data, similar to the token ids.
Menu items can be also be removed from a cart, posting them as an array object with the name of the items in the payload. Every time a menu item is removed from the cart, it is removed from the cart array object inside the user data, similar to the token ids.
A cart can also be deleted by means of the API, with the delete method, emptying the array object of menu items.

A cart can be checked out, by means of the cart checkout method (a post, actually). It'll first iterate through the items list, in order to calculate the final price, and compose the mail message with the invoice including the order's items list and their prices, and the total price.
The payment is performed via stripe.com. I've included the stripe config details in the config.js file, with a token simulating a visa payment.

Once the API receives the OK from the stripe API, the mail with the invoice details is sent to the user's mail address, contacting mailgun service, taking the needed config details from the config.js as well.

Please note that I intentionally left the stripe.com and mailgun keys empty so that the user testing this REST API fills the details in.
