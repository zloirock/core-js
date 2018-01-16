// 20.1.2.4 Number.isNaN(number)
require('./_export')({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});
