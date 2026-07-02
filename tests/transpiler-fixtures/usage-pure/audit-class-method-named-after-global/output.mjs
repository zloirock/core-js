// class methods named after globals must not trigger polyfill: `class C { Map() {...} }`,
// `{ Set() {...} }` shorthand. the method `key` position skips the identifier visitor
// via `isReferenced`'s `CLASS_MEMBER_TYPES` filter (MethodDefinition + key + non-computed).
// confirms `Property` shorthand `key` filter equally for object methods
class C {
  Map() {
    return 1;
  }
  Set(value) {
    return value;
  }
  Promise() {
    return null;
  }
}
const obj = {
  Map() {
    return 2;
  },
  Set(v) {
    return v + 1;
  }
};
const c = new C();
const o = obj;
export { C, obj, c, o };