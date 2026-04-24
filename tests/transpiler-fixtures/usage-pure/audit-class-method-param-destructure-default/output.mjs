import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// class method and object method param destructure with proxy-global default value:
// `{ from } = Array` binds `from` to `Array.from` when the method is called without an
// arg. both method shapes (class body method, object literal shorthand method) must
// polyfill the static method the same way bare `Array.from` would
class C {
  upper({
    from
  } = {
    from: _Array$from
  }) {
    return from([1, 2]);
  }
}
const obj = {
  lower({
    of
  } = {
    of: _Array$of
  }) {
    return of(3, 4);
  }
};
_globalThis.__r = [new C().upper(), obj.lower()];