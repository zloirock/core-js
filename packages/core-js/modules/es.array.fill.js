// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
require('./_export')({ target: 'Array', proto: true }, { fill: require('core-js-internals/array-fill') });

require('./_add-to-unscopables')('fill');
