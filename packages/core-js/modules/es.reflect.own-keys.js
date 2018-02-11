// `Reflect.ownKeys` method
// https://tc39.github.io/ecma262/#sec-reflect.ownkeys
require('../internals/export')({ target: 'Reflect', stat: true }, { ownKeys: require('../internals/own-keys') });
