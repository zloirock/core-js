// a class reaching itself past its binding has no fixed static: `this` in a static member is the class or
// a subclass, a class expression's own name is a binding only its body sees, a write replaces the static
// from where it runs, and a static under a key no canon names may be the one called. each call hands its
// constructor to code no census pairs
class Self {
  static fromText(C, text) {
    return C.from(text);
  }
  static me() {
    return this;
  }
}
const Named = class Inner {
  static cut(M, value) {
    return M.trunc(value);
  }
  static again(value) {
    return Inner.cut(Math, value);
  }
};
class Over {
  static plain(S, strings) {
    return S.raw(strings);
  }
}
Over.plain = (S, codes) => S.fromCodePoint(codes);
class Dynamic {
  static build(O, pairs) {
    return O.fromEntries(pairs);
  }
  static [key]() {}
}
export const list = Self.fromText(Array, 'ab');
export const cut = Named.cut(Math, 1.5);
export const tag = Over.plain(String, 65);
export const built = Dynamic.build(Object, [['a', 1]]);