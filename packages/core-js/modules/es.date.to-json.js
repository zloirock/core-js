'use strict';
var toObject = require('core-js-internals/to-object');
var toPrimitive = require('./_to-primitive');

require('./_export')({ target: 'Date', proto: true, forced: require('core-js-internals/fails')(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
}) }, {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = toObject(this);
    var pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});
