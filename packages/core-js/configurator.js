var isArray = require('./internals/is-array');
var forcedCheck = require('./internals/forced-check');
var data = forcedCheck.data;
var normalize = forcedCheck.normalize;

var setForced = function (object, constant) {
  if (isArray(object)) for (var i = 0; i < object.length; i++) data[normalize(object[i])] = constant;
};

module.exports = function (options) {
  if (typeof options == 'object') {
    setForced(options.useNative, forcedCheck.NATIVE);
    setForced(options.usePolyfill, forcedCheck.POLYFILL);
    setForced(options.useFeatureDetection, forcedCheck.FEATURE_DETECTION);
  }
};
