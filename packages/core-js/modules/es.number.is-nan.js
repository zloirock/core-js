// `Number.isNaN` method
// https://tc39.github.io/ecma262/#sec-number.isnan
require('../internals/export')({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});
