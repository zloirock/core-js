'use strict';
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var anObject = require('../internals/an-object');

var push = [].push;

$({ target: 'Iterator', proto: true }, {
  toArray: function toArray() {
    var result = [];
    iterate(anObject(this), push, result, false, true);
    return result;
  }
});
