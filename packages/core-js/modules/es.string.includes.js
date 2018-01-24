// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var context = require('./_string-context');
var INCLUDES = 'includes';

require('./_export')({ target: 'String', proto: true, forced: require('./_fails-is-regexp')(INCLUDES) }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});
