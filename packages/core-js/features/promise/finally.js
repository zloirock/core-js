require('../../modules/es.promise');
require('../../modules/esnext.promise.finally');

module.exports = require('../../internals/entry-unbind')('Promise', 'finally');
