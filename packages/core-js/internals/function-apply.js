'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-reflect -- safe
module.exports = typeof Reflect == 'object' && Reflect.apply || uncurryThis(uncurryThis.apply);
