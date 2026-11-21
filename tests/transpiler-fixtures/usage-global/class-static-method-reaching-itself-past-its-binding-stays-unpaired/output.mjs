import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
// These mutable or self-referencing classes have open callers. A visible call still contributes
// the statics its argument can supply, while the body must keep reads from a user receiver.
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