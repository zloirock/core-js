// a flat for-init full-consume proxy-global destructure cannot drop its receiver tail - the loop
// header needs a declarator, so the SE prefix and receiver re-embed into a sink declarator. the
// dropped-receiver skip must NOT fire here: the `globalThis` root stays visible and is polyfilled
// (a raw root would ReferenceError on engines lacking it), unlike the standalone-statement form
// which drops the tail entirely.
function eff() {}
for (const { Map } = (eff(), globalThis); false;) {
  console.log(Map);
}
