import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
// a constructor handed to a static method of a class this file declares reaches the parameter the calls
// pair it with, as a literal method's does: the reads its body names load their own statics, whatever
// the spelling - a declaration or a class bound to a name, a method or an arrow field, a dotted or a
// string key
class Lists {
  static fromText(C, text) {
    return C.from(text);
  }
}
const Numbers = class {
  static cut(M, value) {
    return M.trunc(value);
  }
};
class Tags {
  static plain = (S, strings) => S.raw(strings);
}
class Entries {
  static build(O, pairs) {
    return O.fromEntries(pairs);
  }
}
export const list = Lists.fromText(Array, 'ab');
export const cut = Numbers.cut(Math, 1.5);
export const tag = Tags.plain(String, {
  raw: ['a']
});
export const built = Entries['build'](Object, [['a', 1]]);