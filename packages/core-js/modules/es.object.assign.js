var assign = require('../internals/object-assign');

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
require('../internals/export')({ target: 'Object', stat: true, forced: Object.assign !== assign }, { assign: assign });
