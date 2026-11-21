import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
// An exported instance exposes its class through constructor. The visible call supplies Array,
// while external callers can supply their own from method. A private subclass calls its inherited static.
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