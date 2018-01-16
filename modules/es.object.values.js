// 19.1.2.21 Object.values(O)
var $values = require('./_object-to-array')(false);

require('./_export')({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});
