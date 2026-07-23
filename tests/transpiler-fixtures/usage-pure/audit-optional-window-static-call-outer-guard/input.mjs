// three window-optional forms where a receiver-independent static under a KEPT trailing-instance guard must
// read BARE, and a bare-window ctor.static must collapse without crashing:
//   - bareCtorStatic: `globalThis.window?.Number.MAX_SAFE_INTEGER.toFixed(1)` - the whole proxy-root.ctor.static
//     subsumes into one pure static (the bare root skipped), guard erased. before: transform-queue crash.
//   - aliasStaticCall: `(w = g)?.Array.from([1])...` (g = globalThis alias) - the `.from` static reads bare
//     `_Array$from([1])`, NOT `(w = g, _Array$from)` (which double-ran the assign under the `.at` guard).
//   - seqStaticCall: `(c++, v = globalThis.window)?.Array.of(5)...` - same, plus the seq guard root substitutes
//     its buried `globalThis` (`(c++, v = _globalThis.window)`) and the `.of` reads bare `_Array$of(5)` (SE once).
// an outer guard that memoizes+runs the root SE owns it; the static must not re-fold it. distinct method per line.
let w;
let v;
let c = 0;
const g = globalThis;
export const bareCtorStatic = globalThis.window?.Number.MAX_SAFE_INTEGER.toFixed(1);
export const aliasStaticCall = (w = g)?.Array.from([1]).includes(1);
export const seqStaticCall = ((c++, v = globalThis.window))?.Array.of(5).at(0);
