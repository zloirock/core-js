'use strict';
var classof = require('../../internals/classof');
var hasOwn = require('../../internals/has-own-property');
require('../../modules/web.dom-collections.for-each');

var forEach = [].forEach;

var DOMIterables = {
  DOMTokenList: true,
  NodeList: true,
};

module.exports = function (it) {
  var own = it.forEach;
  return hasOwn(DOMIterables, classof(it)) ? forEach : own;
};
