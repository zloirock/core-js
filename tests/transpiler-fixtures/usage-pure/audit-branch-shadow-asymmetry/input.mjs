// shadow-check asymmetry: bare Identifier `Array` is shadowed by the param,
// MemberExpression `globalThis.Array` is NOT (proxy-global chain bottoms out on the
// global). isViableBranchForKey applies the shadow check ONLY to Identifier shape;
// MemberExpression's binding hop is delegated to resolveObjectName which walks the
// chain and validates `globalThis` against POSSIBLE_GLOBAL_OBJECTS without hitting
// the local Array binding. expected: `Array` branch declines (shadowed), member
// branch resolves -> fromFallback fires with mixed-shape outcome
function f(Array, { from } = cond ? Array : globalThis.Array) {
  return from([1]);
}
// confirm the symmetric case where bare Array is unshadowed: both branches viable,
// synth-swap rewrites both to the same polyfill literal
function g({ of } = cond ? Array : globalThis.Array) {
  return of(1, 2);
}
export { f, g };
