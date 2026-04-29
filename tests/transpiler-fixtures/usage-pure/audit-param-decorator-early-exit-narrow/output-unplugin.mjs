import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// narrowing via early-exit `if (typeof ...) return;` inside a parameter
// decorator's inline function must apply to its body the same way it does
// for class-level decorators, so `x.at(0)` selects the string polyfill.
function pdec(fn: (x: number | string) => void) { return (_: any, __: any, ___: any) => {}; }

class A {
  m(@pdec((x) => {
    if (typeof x !== 'string') return;
    _atMaybeString(x).call(x, 0);
  }) p: any) {}
}