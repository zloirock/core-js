// `Int8Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
require('../internals/typed-array-constructor')('Int8', 1, function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});
