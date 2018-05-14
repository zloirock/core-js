// `Float64Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
require('../internals/typed-array-constructor')('Float64', 8, function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});
