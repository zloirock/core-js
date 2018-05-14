// `Date.now` method
// https://tc39.github.io/ecma262/#sec-date.now
require('../internals/export')({ target: 'Date', stat: true }, {
  now: function now() {
    return new Date().getTime();
  }
});
