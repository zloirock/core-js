// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
require('../internals/export')({ target: 'Object', stat: true }, { create: require('../internals/object-create') });
