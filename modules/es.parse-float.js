var $parseFloat = require('./_parse-float');
// 18.2.4 parseFloat(string)
require('./_export')({ global: true, forced: parseFloat != $parseFloat }, { parseFloat: $parseFloat });
