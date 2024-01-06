'use strict';
var domIterablesDefineMethod = require('../internals/dom-iterables-define-method');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
// dependency: es.array.iterator
domIterablesDefineMethod('values', [][ITERATOR], true);
