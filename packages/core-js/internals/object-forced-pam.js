'use strict';
// Forced replacement prototype accessors methods
module.exports = require('../internals/is-pure') || !require('../internals/fails')(function () {
  var K = Math.random();
  // In FF throws only define methods
  // eslint-disable-next-line no-undef, no-useless-call
  __defineSetter__.call(null, K, function () { /* empty */ });
  delete require('../internals/global')[K];
});
