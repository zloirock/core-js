// `Reflect.ownKeys` method
// https://tc39.github.io/ecma262/#sec-reflect.ownkeys
require('./_export')({ target: 'Reflect', stat: true }, { ownKeys: require('./_own-keys') });
