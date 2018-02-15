// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
require('../internals/export')({ target: 'Object', stat: true }, {
  setPrototypeOf: require('../internals/object-set-prototype-of')
});
