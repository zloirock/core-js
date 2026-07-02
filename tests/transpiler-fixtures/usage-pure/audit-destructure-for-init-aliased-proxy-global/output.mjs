import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init full-consume + SE prefix on an ALIASED proxy-global receiver (`obj` bound to
// globalThis). the aliased Identifier tail keeps the user binding `obj`; the alias decl's own
// `= globalThis` init is polyfilled separately, outside the flatten range. emit shape
// `_unused = (logCall(), obj)` re-embeds the SE but keeps `obj`, not `_globalThis`.
declare const logCall: () => any;
const obj = _globalThis;
for (const from = _Array$from, _unused = (logCall(), obj); false;) {
  console.log(from);
}