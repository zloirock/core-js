import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// multi-decl flatten with sibling that locally shadows the receiver name via `let` inside
// a block scope. without block-scope tracking in `polyfillSiblingReceiverRefs.walk`, the
// inner `globalThis` reference would be rewritten to `_globalThis` even though the local
// `let globalThis` shadows it - changing runtime semantics from "user-bound shadow" to
// "polyfilled global"
const y = (() => {
  let globalThis = 'shadow';
  return globalThis;
})();
export { from, y };