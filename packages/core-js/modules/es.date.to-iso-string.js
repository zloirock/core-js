// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var toISOString = require('core-js-internals/date-to-iso-string');

// PhantomJS / old WebKit has a broken implementations
require('./_export')({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== toISOString }, {
  toISOString: toISOString
});
