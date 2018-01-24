// 26.1.14 Reflect.setPrototypeOf(target, proto)
var setProto = require('./_set-proto');

if (setProto) require('./_export')({ target: 'Reflect', stat: true }, {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch (e) {
      return false;
    }
  }
});
