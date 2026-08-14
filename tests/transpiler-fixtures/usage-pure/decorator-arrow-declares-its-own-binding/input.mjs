// a parameter decorator is evaluated outside the decorated function, so nothing that function
// declares covers a use inside it - but what the DECORATOR ITSELF declares does. the first
// method reads the real global past the shadow its own body holds, the second reads the
// decorator arrow's own parameter and must stay native.
function pdec(fn: any) { return (_: any, __: any, ___: any) => {}; }

class A {
  m(@pdec(() => { Object.entries({ a: 1 }); }) p: any) { var Object = 1; }
  n(@pdec((Reflect: any) => { Reflect.ownKeys({ b: 2 }); }) q: any) {}
}
