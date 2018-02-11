// `Object.is` method
// https://tc39.github.io/ecma262/#sec-object.is
require('../internals/export')({ target: 'Object', stat: true }, { is: require('core-js-internals/same-value') });
