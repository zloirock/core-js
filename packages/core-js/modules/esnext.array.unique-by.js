'use strict';
var $ = require('../internals/export');
var toLength = require('../internals/to-length');
var toObject = require('../internals/to-object');
var getBuiltIn = require('../internals/get-built-in');
var arraySpeciesCreate = require('../internals/array-species-create');
var addToUnscopables = require('../internals/add-to-unscopables');

var push = [].push;

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
$({ target: 'Array', proto: true }, {
  uniqueBy: function uniqueBy(resolver) {
    var that = toObject(this);
    var length = toLength(that.length);
    var result = arraySpeciesCreate(that, 0);
    var Map = getBuiltIn('Map');
    var map = new Map();
    var index, item, key;
    var resolverFunction = typeof resolver == 'function' ? resolver : resolver == null ? function (value) {
      return value;
    } : function (value) {
      return value != null ? value[resolver] : value;
    };
    for (index = 0; index < length; index++) {
      item = that[index];
      key = resolverFunction(item);
      if (!map.has(key)) map.set(key, item);
    }
    map.forEach(function (value) {
      push.call(result, value);
    });
    return result;
  }
});

addToUnscopables('uniqueBy');
