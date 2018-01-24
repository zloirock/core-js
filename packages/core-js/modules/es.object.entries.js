// 19.1.2.5 Object.entries(O)
var $entries = require('./_object-to-array')(true);

require('./_export')({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});
