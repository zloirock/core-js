var DESCRIPTORS = require('core-js-internals/descriptors');
var IE8_DOM_DEFINE = require('core-js-internals/ie8-dom-define');
var anObject = require('core-js-internals/an-object');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = DESCRIPTORS ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};
