// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
require('./_export')({ target: 'Object', stat: true }, { setPrototypeOf: require('./_set-proto').set });
