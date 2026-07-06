import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3;
// Flow dialect of the supplied-but-opaque rule: a nullable (`?T`) or union param wrapper
// blocks direct inference, so a present-but-untypeable arg must degrade to the generic
// helper instead of leaking the declared default; a bare-T param still binds the arg type
declare var opaque: Foo;
function nullable<T = string>(x: ?T): T {
  return (x: any);
}
_at(_ref = nullable(opaque)).call(_ref, 0);
function unioned<T = string>(x: T | null): T {
  return (x: any);
}
_includes(_ref2 = unioned(opaque)).call(_ref2, 1);
function bare<T = number[]>(x: T): T {
  return x;
}
_atMaybeString(_ref3 = bare('abc')).call(_ref3, 0);