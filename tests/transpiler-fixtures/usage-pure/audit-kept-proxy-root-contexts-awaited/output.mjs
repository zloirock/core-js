import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export async function awaited() {
  let aw;
  return (aw = await _Promise$resolve(_globalThis.window))?.[c++, 'self']?.Array ?? null;
}