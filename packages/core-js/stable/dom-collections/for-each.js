'use strict';
require('../../modules/web.dom-collections.for-each');
var uncurryThis = require('../../internals/function-uncurry-this');

module.exports = uncurryThis([].forEach);
