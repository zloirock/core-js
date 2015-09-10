// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $def = require('./$.def');

$def($def.P, 'Array', {fill: require('./$.array-fill')});

require('./$.unscope')('fill');