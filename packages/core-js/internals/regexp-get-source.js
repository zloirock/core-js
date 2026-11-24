'use strict';
var getInternalState = require('../internals/internal-state').get;
var nativeSource = require('../internals/regexp-native-source');

var RegExpPrototype = RegExp.prototype;

// The native matcher only knows the translated pattern when named groups are emulated.
module.exports = function (it) {
  var rawSource = getInternalState(it).rawSource;
  if (rawSource) return rawSource;
  if (nativeSource && it !== RegExpPrototype) try {
    return nativeSource(it);
  } catch (error) { /* RegExp-like object */ }
  return it.source;
};
