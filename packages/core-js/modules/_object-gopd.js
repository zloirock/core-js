var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIndexedObject = require('core-js-internals/to-indexed-object');
var toPrimitive = require('./_to-primitive');
var has = require('core-js-internals/has');
var IE8_DOM_DEFINE = require('core-js-internals/ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('core-js-internals/descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};
