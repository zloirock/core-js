// 21.2.5.3 get RegExp.prototype.flags()
var $ = require('./_');
if(require('./_descriptors') && /./g.flags != 'g')$.setDesc(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});