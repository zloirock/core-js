import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The implicit read calls a user getter once before the conditional fallback write.
// A second read could select another method and suppress the source fallback.
let reads = 0;
const receiver = [];
Object.defineProperty(receiver, "at", {
  get() {
    return reads++ ? () => "late" : undefined;
  },
  set(value) {
    store(value);
  }
});
export const method = _atMaybeArray((receiver, effect(), "at", receiver)) || (receiver["at"] = fallback());