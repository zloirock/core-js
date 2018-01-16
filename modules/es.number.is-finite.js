// 20.1.2.2 Number.isFinite(number)
var _isFinite = require('./_global').isFinite;

require('./_export')({ target: 'Number', stat: true }, {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  }
});
