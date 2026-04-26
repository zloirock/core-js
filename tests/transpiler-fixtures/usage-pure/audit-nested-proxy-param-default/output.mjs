import _globalThis from "@core-js/pure/actual/global-this";
// `function f({Array: {from}} = globalThis)` - AssignmentPattern as function param default.
// excluded from nested-proxy detection: inline-default `{from = _Array$from}` would pick
// native first on modern engines (contradicting usage-pure's polyfill-always contract),
// but rewriting to direct `const from = _Array$from` inside the body would break the
// param-default semantic (caller can pass custom value). user must rewrite manually as
// `function f() { const from = _Array$from; ... }` to get the polyfill
export function f({
  Array: {
    from
  }
} = _globalThis) {
  return from([1, 2, 3]);
}