var $parseFloat = require('./_parse-float');
// 20.1.2.12 Number.parseFloat(string)
require('./_export')({ target: 'Number', stat: true, forced: Number.parseFloat != $parseFloat }, {
  parseFloat: $parseFloat
});
