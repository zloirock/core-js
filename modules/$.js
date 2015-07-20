var global = typeof self != 'undefined' && self.Math == Math ? self : Function('return this')()
  , core   = {};

module.exports = {
  FW:         true,
  g:          global,
  core:       core,
  path:       global,
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    Object.defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object:  Object,
  each:       [].forEach
};
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
