import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref4;
// a namespace body is a lexical container on both parsers but a scope level on only one, and a
// switch hosts its declarations under `cases` - either gap leaves the declaration unreachable or
// answers with an outer namesake. the last two lines are the negatives: a declaration written
// OUTSIDE keeps its own meaning when the value is read inside a namespace
interface Outer {
  items: string;
}
declare const outside: Outer;
declare const k: number;
export let cased: number | undefined;
namespace NS {
  var _ref2, _ref3;
  interface Inner {
    items: number[];
  }
  declare function make(): Inner;
  export function readParam(v: Inner) {
    var _ref;
    return _atMaybeArray(_ref = v.items).call(_ref, 0);
  }
  export const fromAmbient = _includesMaybeArray(_ref2 = make().items).call(_ref2, 1);
  export const outer = _atMaybeString(_ref3 = outside.items).call(_ref3, 0);
}
switch (k) {
  case 1:
    interface Cased {
      items: number[];
    }
    declare const local: Cased;
    cased = _flatMaybeArray(_ref4 = local.items).call(_ref4).length;
}
export const r = [NS.readParam({
  items: [1]
}), NS.fromAmbient, NS.outer, cased];