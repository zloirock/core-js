require('../../modules/es.object.to-string');
var classof = require('../../internals/classof');

module.exports = function (it) {
  return '[object ' + classof(it) + ']';
};
