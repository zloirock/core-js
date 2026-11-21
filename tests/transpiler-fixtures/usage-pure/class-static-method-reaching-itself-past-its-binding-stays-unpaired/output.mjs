import _Array$from from "@core-js/pure/actual/array/from";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _String$raw from "@core-js/pure/actual/string/raw";
// These mutable or self-referencing classes have open callers. A visible call still contributes
// the statics its argument can supply, while the body must keep reads from a user receiver.
class Self {
  static fromText(C, text) {
    return (C === Array ? _Array$from : C.from.bind(C))(text);
  }
  static me() {
    return this;
  }
}
const Named = class Inner {
  static cut(M, value) {
    return (M === Math ? _Math$trunc : M.trunc.bind(M))(value);
  }
  static again(value) {
    return Inner.cut(Math, value);
  }
};
class Over {
  static plain(S, strings) {
    return (S === String ? _String$raw : S.raw.bind(S))(strings);
  }
}
Over.plain = (S, codes) => (S === String ? _String$fromCodePoint : S.fromCodePoint.bind(S))(codes);
class Dynamic {
  static build(O, pairs) {
    return (O === Object ? _Object$fromEntries : O.fromEntries.bind(O))(pairs);
  }
  static [key]() {}
}
export const list = Self.fromText(Array, 'ab');
export const cut = Named.cut(Math, 1.5);
export const tag = Over.plain(String, 65);
export const built = Dynamic.build(Object, [['a', 1]]);