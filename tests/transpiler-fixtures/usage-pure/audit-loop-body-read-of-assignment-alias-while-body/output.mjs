import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// an assignment-form alias read in a LOOP BODY resolves the single unconditional write before the
// loop: the back-edge re-runs the read, never the write. a write INSIDE the loop can reach the next
// iteration's read, and a conditional write proves nothing - both keep the read native in the pure
// flavor. one global per row keeps every row's own module in the import set
export function whileBody() {
  let w;
  w = _globalThis;
  while (w) {
    return _Array$of(1);
  }
}