import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init FULL-consume + SE prefix: every outer prop is extracted (no `...rest`). the
// preservedSrc would otherwise be null after extraction, so the sink declarator's tail
// carries the receiver value `(logCall(), _globalThis)` to keep the declarator valid.
// distinct from partial-consume where preservedSrc holds the rest-destructure and the
// sink uses `void 0` as tail
declare const logCall: () => any;
for (const from = _Array$from, _unused = (logCall(), _globalThis); false;) {
  console.log(from);
}