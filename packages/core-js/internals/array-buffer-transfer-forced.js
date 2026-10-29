'use strict';
var globalThis = require('../internals/global-this');
var IS_NODE = require('../internals/environment-is-node');

// NodeJS 21 and 22.0-22.3 crash when native transfer cannot allocate the result
// https://github.com/nodejs/node/pull/52910
module.exports = IS_NODE && /^(?:21\.|22\.[0-3]\.)/.test(globalThis.process.versions.node);
