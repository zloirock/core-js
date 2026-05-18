import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init partial-consume + MULTIPLE SE prefix elements. all leading expressions
// re-embed at the receiver slot of the preserved declarator's init so native
// `(a(), b(), receiver)` eval order survives: emit shape `{...} = (a(), b(), _globalThis)`
declare const a: () => void;
declare const b: () => void;
for (const from = _Array$from, {
    Array: _unused,
    ...rest
  } = (a(), b(), _globalThis); false;) {
  console.log(from, rest);
}