// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let tail = [{}, {}];
let ax, AM, AS;
([ax, { Promise: AM }] = [...tail, globalThis]);
const [{ Set: C }, { WeakMap: W }] = [globalThis, ...tail];
export const viaSpreadAfter = new C(afterSeed);
