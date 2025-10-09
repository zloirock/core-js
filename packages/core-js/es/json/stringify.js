'use strict';
require('../../modules/es.date.to-json');
require('../../modules/es.json.stringify');
var path = require('../../internals/path');
var apply = require('../../internals/function-apply');

// eslint-disable-next-line no-unused-vars -- required for `.length`
module.exports = function stringify(it, replacer, space) {
  return apply(path.JSON.stringify, null, arguments);
};
