require('../../modules/es.set.constructor');
require('../../modules/esnext.set.every');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'every');
