/* eslint-disable no-extend-native, strict, no-var -- required */
Function.prototype.bind = function () {
  var __method = this,
      args = [].slice.call(arguments),
      object = args.shift();
  return function () {
    return __method.apply(object, args.concat([].slice.call(arguments)));
  };
};
