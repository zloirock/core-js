// a user-mutated static routes every surface through the injected CONSTRUCTOR (patch-wins).
// the static's own import LOOKS binding-unused, but it is LOAD-BEARING: the pure module
// attaches the method to the pure constructor on load, and the ctor-routed read depends on
// it (a conditional user patch would otherwise read undefined) - it must STAY. a LIVE
// static keeps its import as ever
globalThis.Map.groupBy = patched;
export const viaMutatedStatic = globalThis.Map.groupBy([], f);
export const viaLiveStatic = Array.from([1]);

// the same patch spelled through a HELD pure ctor import (the shape a SECOND plugin pass
// sees after the first pass minted `_Map`): the minted-shape mutation gate + the ctor
// import-source recognition register the mutated static, so the read keeps the patch
import HeldMap from '@core-js/pure/actual/map/constructor';
HeldMap.groupBy = patched2;
export const viaHeldCtorImport = HeldMap.groupBy([], f);
