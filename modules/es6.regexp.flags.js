// 21.2.5.3 get RegExp.prototype.flags()
var $ = require('./$');
if($.DESC && /./g.flags != 'g')$.setDesc(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./$.flags')
});