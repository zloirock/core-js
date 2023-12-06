'use strict';
require('../modules/es.array.iterator');
require('../modules/es.object.to-string');
require('../modules/es.map.constructor');
require('../modules/es.set.constructor');
require('../modules/web.dom-exception.constructor');
require('../modules/web.dom-exception.stack');
require('../modules/web.dom-exception.to-string-tag');
require('../modules/web.structured-clone');
var path = require('../internals/path');

module.exports = path.structuredClone;
