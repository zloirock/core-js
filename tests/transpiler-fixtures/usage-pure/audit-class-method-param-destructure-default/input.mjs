// class method and object method param destructure with proxy-global default value:
// `{ from } = Array` binds `from` to `Array.from` when the method is called without an
// arg. both method shapes (class body method, object literal shorthand method) must
// polyfill the static method the same way bare `Array.from` would
class C {
  upper({ from } = Array) { return from([1, 2]); }
}
const obj = {
  lower({ of } = Array) { return of(3, 4); },
};
globalThis.__r = [new C().upper(), obj.lower()];
