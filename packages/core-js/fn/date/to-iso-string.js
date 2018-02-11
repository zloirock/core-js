require('../../modules/es.date.to-json');
require('../../modules/es.date.to-iso-string');

module.exports = require('../../internals/entry-unbind')('Date', 'toISOString');
