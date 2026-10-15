import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
// a class this file also constructs or extends keeps its statics' callers where the file sees every one: an
// instance reaches the statics only through a `constructor` read, which this file never spells, and a subclass
// calls them as its own. a class handed out pairs nothing: its callers outside pass whatever they pass
class Lists {
  static fromText(C, text) {
    return new Lists(C.from(text));
  }
  constructor(items) {
    this.items = items;
  }
}
class Base {
  static cut(M, value) {
    return M.trunc(value);
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