// an INHERITED static extracted through the subclass binding (`Sub.read`) rebinds `this`
// away from the base at its later invocation - the ancestors' static sets merge into the
// method-aware classifier, so the extraction widens the base field narrow exactly like
// an own-static extraction does
class Base {
  data = [1, 2];
  static read(o) {
    return o.data.at(0);
  }
}
class Sub extends Base {}
const extracted = Sub.read;
export const viaInheritedExtract = extracted;

// own-static control (covered sibling): extraction off the declaring class widens too
class Solo {
  data = [3, 4];
  static read(o) {
    return o.data.includes(3);
  }
}
const ownExtracted = Solo.read;
export const viaOwnExtract = ownExtracted;
