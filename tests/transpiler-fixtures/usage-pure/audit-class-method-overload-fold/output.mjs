import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// declare-class method overloads resolve per call-site like interface overloads: a literal arg matches the
// overload whose literal param equals it (`get('a')` -> string, `get('c')` -> string[]); a keyword arg matches
// by primitive kind. an unresolvable arg over a DIVERGENT overload set folds to generic - NOT the last/first
// arm, which would emit a type-specific Maybe that throws on a foreign return. The class-member lookup's last-wins
// reverse-walk previously picked one arm regardless of the args; babel and unplugin share the provider verdict
declare class Reg {
  get(k: 'a'): string;
  get(k: 'c'): string[];
  lookup(x: string): number[];
  lookup(x: boolean): string;
}
declare const reg: Reg;
_atMaybeString(_ref = reg.get('a')).call(_ref, 0);
_includesMaybeArray(_ref2 = reg.get('c')).call(_ref2, 1);
function probe(u) {
  var _ref3;
  return _at(_ref3 = reg.lookup(u)).call(_ref3, -1);
}