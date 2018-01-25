// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
require('./_export')({ target: 'Array', stat: true }, { isArray: require('core-js-internals/is-array') });
