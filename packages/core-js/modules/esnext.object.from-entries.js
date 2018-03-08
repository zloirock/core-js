var iterate = require('../internals/iterate');
var createProperty = require('../internals/create-property');

require('../internals/export')({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate(iterable, true, function (k, v) {
      createProperty(obj, k, v);
    });
    return obj;
  }
});
