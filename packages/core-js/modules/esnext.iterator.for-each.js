'use strict';
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var anObject = require('../internals/an-object');

$({ target: 'Iterator', proto: true }, {
  forEach: function forEach(fn) {
    iterate(anObject(this), fn, undefined, false, true);
  }
});
