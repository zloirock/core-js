'use strict';

var _Array$from = require("@core-js/pure/actual/array/from");
var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _findLastMaybeArray = require("@core-js/pure/actual/array/instance/find-last");
var _flatMaybeArray = require("@core-js/pure/actual/array/instance/flat");
// The memo for the result of from(arr) belongs after the directive and all requires.
require('side-effect-module');
var _ref;
const from = _Array$from;
const arr = from('hi');
const tail = _atMaybeArray(_ref = from(arr)).call(_ref, -1);
const found = _findLastMaybeArray(arr).call(arr, x => x);
const flat = _flatMaybeArray(arr).call(arr);
console.log(tail, found, flat);