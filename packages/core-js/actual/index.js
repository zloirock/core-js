'use strict';
var stable = require('../stable');
var stage = require('../stage/3');

// Use both exports so bundlers keep the registrations on their shared namespace.
module.exports = stable && stage;
