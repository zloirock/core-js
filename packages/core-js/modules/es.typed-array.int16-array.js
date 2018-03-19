// `Int16Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
require('../internals/typed-array-constructor')('Int16', 2, function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});
