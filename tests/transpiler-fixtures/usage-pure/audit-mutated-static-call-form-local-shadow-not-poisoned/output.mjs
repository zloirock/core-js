import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Promise from "@core-js/pure/actual/promise/constructor";
// the CALL-form mutated-static collectors (`Object.assign(Array, {...})`, `Reflect.set(Map, ...)`,
// `Object.defineProperty(...)`) must shadow-check the NAMESPACE callee, not just the target arg. here
// `Object` / `Reflect` are local params, so the call patches nothing global -> the file-wide `Array.from`
// / `Map.groupBy` reads must still get the polyfill. for contrast, a GENUINE global `Object.assign(Promise,
// ...)` records `Promise.any` as mutated and suppresses its read. distinct builtins show per-namespace-scope
// discrimination (the existing -local-shadow-not-poisoned fixture covers only the direct-assignment form).
// the shadow may bind at ANY depth: `block` shadows `Object` with a block-level `let`, not a param, so
// `Array.of` must still polyfill - the shadow check reads the whole enclosing scope chain
function patchObj(Object) {
  Object.assign(Array, {
    from() {
      return [];
    }
  });
}
function patchRef(Reflect) {
  Reflect.set(_Map, "groupBy", function () {});
}
function block() {
  let Object = {
    assign() {}
  };
  Object.assign(Array, {
    of() {}
  });
}
patchObj({});
patchRef({});
block();
_Array$from([1, 2, 3]);
_Array$of(7);
_Map$groupBy([1], () => 0);
_Object$assign(_Promise, {
  any() {}
});
_Promise.any([1]);