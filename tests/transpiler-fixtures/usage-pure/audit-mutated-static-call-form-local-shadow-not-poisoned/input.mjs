// the CALL-form mutated-static collectors (`Object.assign(Array, ...)`, `Reflect.set(Map, ...)`,
// `Object.defineProperty(...)`) must shadow-check the NAMESPACE callee, not just the target arg. here
// `Object` / `Reflect` are local (param, or a block-level `let` at ANY depth), so the call patches
// nothing global and the file-wide `Array.from` / `Array.of` / `Map.groupBy` reads still get the polyfill.
// contrast: a GENUINE global `Object.assign(Promise, ...)` records `Promise.any` mutated and suppresses its read.
function patchObj(Object) { Object.assign(Array, { from() { return []; } }); }
function patchRef(Reflect) { Reflect.set(Map, "groupBy", function () {}); }
function block() {
  let Object = { assign() {} };
  Object.assign(Array, { of() {} });
}
patchObj({});
patchRef({});
block();
Array.from([1, 2, 3]);
Array.of(7);
Map.groupBy([1], () => 0);
Object.assign(Promise, { any() {} });
Promise.any([1]);
