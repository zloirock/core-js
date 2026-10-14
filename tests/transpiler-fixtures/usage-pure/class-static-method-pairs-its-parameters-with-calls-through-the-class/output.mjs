import _Array$from from "@core-js/pure/actual/array/from";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _String$raw from "@core-js/pure/actual/string/raw";
// a constructor handed to a static method of a class this file declares reaches the parameter the calls
// pair it with, as a literal method's does: the reads its body names load their own statics, whatever
// the spelling - a declaration or a class bound to a name, a method or an arrow field, a dotted or a
// string key
class Lists {
  static fromText(C, text) {
    return _Array$from(text);
  }
}
const Numbers = class {
  static cut(M, value) {
    return _Math$trunc(value);
  }
};
class Tags {
  static plain = (S, strings) => _String$raw(strings);
}
class Entries {
  static build(O, pairs) {
    return _Object$fromEntries(pairs);
  }
}
export const list = Lists.fromText(Array, 'ab');
export const cut = Numbers.cut(Math, 1.5);
export const tag = Tags.plain(String, {
  raw: ['a']
});
export const built = Entries['build'](Object, [['a', 1]]);