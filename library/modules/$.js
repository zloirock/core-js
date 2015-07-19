'use strict';
var global = typeof self != 'undefined' && self.Math == Math ? self : Function('return this')()
  , core   = {}
  , hasOwnProperty = {}.hasOwnProperty;

module.exports = require('./$.fw')({
  g: global,
  core: core,
  // http://jsperf.com/core-js-isobject
  isObject: function(it){
    return it !== null && (typeof it == 'object' || typeof it == 'function');
  },
  isFunction: function(it){
    return typeof it == 'function';
  },
  that: function(){
    return this;
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
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
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
