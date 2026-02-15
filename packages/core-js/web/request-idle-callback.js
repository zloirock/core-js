'use strict';
require('../modules/es.map');
require('../modules/web.timers');
require('../modules/web.request-idle-callback');
var path = require('../internals/path');

module.exports = path.requestIdleCallback;
