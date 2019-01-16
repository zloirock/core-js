'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('link');

// `String.prototype.link` method
// https://tc39.github.io/ecma262/#sec-string.prototype.link
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  link: function link(url) {
    return createHTML(this, 'a', 'href', url);
  }
});
