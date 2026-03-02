'use strict';
var hasOwn = require('../internals/has-own-property');

var FunctionPrototype = Function.prototype;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && function something() { /* empty */ }.name === 'something';
var CONFIGURABLE = EXISTS && Object.getOwnPropertyDescriptor(FunctionPrototype, 'name').configurable;

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE,
};
