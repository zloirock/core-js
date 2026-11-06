// regression-guard: a static extracted through the subclass binding (`Sub.read`) dispatches
// GENERIC helpers on its untyped parameter - a type-specific dispatcher for `o.data` here
// would throw on foreign runtime receivers. (this locks the safe outcome; it does not
// isolate the widen-on-extraction mechanism, which needs a receiver whose narrow depends
// on the rebound `this`)
class Base {
  data = [1, 2];
  static read(o) {
    return o.data.at(0);
  }
}
class Sub extends Base {}
const extracted = Sub.read;
export const viaInheritedExtract = extracted;

// own-static twin: the same generic outcome off the declaring class
class Solo {
  data = [3, 4];
  static read(o) {
    return o.data.includes(3);
  }
}
const ownExtracted = Solo.read;
export const viaOwnExtract = ownExtracted;
