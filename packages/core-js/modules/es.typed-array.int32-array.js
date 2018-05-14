// `Int32Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
require('../internals/typed-array-constructor')('Int32', 4, function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});
