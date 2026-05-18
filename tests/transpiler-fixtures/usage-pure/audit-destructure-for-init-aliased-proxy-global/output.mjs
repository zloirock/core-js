import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init full-consume + SE prefix on an ALIASED proxy-global receiver (`obj` bound to
// globalThis). `resolveSinkTailSrc` shares dispatch semantics with non-for-init's
// `receiverEmitSrc`: aliased Identifier tail keeps user binding `obj` (matches babel
// byte-for-byte; alias decl's own `= globalThis` init is polyfilled by the natural visitor
// outside the flatten range). emit shape: `_unused = (logCall(), obj)` - SE re-embedded
// into the synth sink receiver, but receiver stays as user binding instead of `_globalThis`
declare const logCall: () => any;
const obj = _globalThis;
for (const from = _Array$from, _unused = (logCall(), obj); false;) {
  console.log(from);
}