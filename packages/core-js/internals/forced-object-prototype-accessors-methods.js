'use strict';
// Forced replacement object prototype accessors methods
module.exports = require('../internals/is-pure') || !require('../internals/fails')(function () {
  var key = Math.random();
  // In FF throws only define methods
  // eslint-disable-next-line no-undef, no-useless-call
  __defineSetter__.call(null, key, function () { /* empty */ });
  delete require('../internals/global')[key];
});
