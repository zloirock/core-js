import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a flat for-init full-consume proxy-global destructure cannot drop its receiver tail - the loop
// header needs a declarator, so the SE prefix and receiver re-embed into a sink declarator. the
// dropped-receiver skip must NOT fire here: the `globalThis` root stays visible and is polyfilled
// (a raw root would ReferenceError on engines lacking it), unlike the standalone-statement form
// which drops the tail entirely.
function eff() {}
for (const _ref = (eff(), _globalThis), Map = _Map; false;) {
  console.log(Map);
}