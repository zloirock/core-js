var fails = require('../internals/fails');

var forcedCheck = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = forcedCheck.normalize = function (string) {
  return String(string).split('#').join('.prototype.');
};

var data = forcedCheck.data = {};
var NATIVE = forcedCheck.NATIVE = 'N';
var POLYFILL = forcedCheck.POLYFILL = 'P';
forcedCheck.FEATURE_DETECTION = 'D';

module.exports = forcedCheck;
