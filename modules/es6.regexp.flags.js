// 21.2.5.3 get RegExp.prototype.flags()
if(/./g.flags != 'g')require('./$').setDesc(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./$.flags')
});