// types: web/iterable-dom-collections
'use strict';
var domIterablesDefineMethod = require('../internals/dom-iterables-define-method');

// @dependency: es.array.keys
// eslint-disable-next-line es/no-array-prototype-keys -- safe
domIterablesDefineMethod('keys', [].keys, true);
