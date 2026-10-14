import _Array$from from "@core-js/pure/actual/array/from";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// a class this file also constructs or extends keeps its statics' callers where the file sees every one: an
// instance reaches the statics only through a `constructor` read, which this file never spells, and a subclass
// calls them as its own. a class handed out pairs nothing: its callers outside pass whatever they pass
class Lists {
  static fromText(C, text) {
    return new Lists(_Array$from(text));
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
    return S.raw(strings);
  }
}
hand(Shared);
export const list = Lists.fromText(Array, 'ab');
export const cut = Derived.cut(Math, 1.5);
export const tag = Shared.plain(String, {
  raw: ['a']
});