import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// param-level decorator's inline-function walk goes through `walkDecorators` ->
// `walkDecoratorList(param.decorators)` - narrowing via early-exit `if (typeof ...) return;`
// inside the decorator arg must keep firing for params too, not only class-level decorators
function pdec(fn: (x: number | string) => void) { return (_: any, __: any, ___: any) => {}; }

class A {
  m(@pdec((x) => {
    if (typeof x !== 'string') return;
    _atMaybeString(x).call(x, 0);
  }) p: any) {}
}