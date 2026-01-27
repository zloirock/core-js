'use strict';
var domIterablesDefineMethod = require('../internals/dom-iterables-define-method');

// @dependency: es.array.entries
// eslint-disable-next-line es/no-array-prototype-entries -- safe
domIterablesDefineMethod('entries', [].entries, true);
