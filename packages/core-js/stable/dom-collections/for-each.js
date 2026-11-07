'use strict';
require('../../modules/web.dom-collections.for-each');
var uncurryThis = require('../../internals/function-uncurry-this');
var forEach = require('../../internals/array-for-each');

module.exports = uncurryThis(forEach);
