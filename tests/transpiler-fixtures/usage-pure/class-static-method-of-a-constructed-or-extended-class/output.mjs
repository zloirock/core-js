import _Array$from from "@core-js/pure/actual/array/from";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _String$raw from "@core-js/pure/actual/string/raw";
// An exported instance exposes its class through constructor. The visible call supplies Array,
// while external callers can supply their own from method. A private subclass calls its inherited static.
class Lists {
  static fromText(C, text) {
    return new Lists((C === Array ? _Array$from : C.from.bind(C))(text));
  }
  constructor(items) {
    this.items = items;
  }
}
class Base {
  static cut(M, value) {
    return _Math$trunc(value);
  }
}
class Derived extends Base {}
class Shared {
  static plain(S, strings) {
    return (S === String ? _String$raw : S.raw.bind(S))(strings);
  }
}
hand(Shared);
export const list = Lists.fromText(Array, 'ab');
export const cut = Derived.cut(Math, 1.5);
export const tag = Shared.plain(String, {
  raw: ['a']
});