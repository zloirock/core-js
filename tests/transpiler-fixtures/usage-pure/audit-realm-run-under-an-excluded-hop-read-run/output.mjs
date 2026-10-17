import _globalThis from "@core-js/pure/actual/global-this";
export const deleteRun = delete _globalThis.window;
// ... and what the dropped span DID rides out exactly once: a live sequence prefix already sits
// inside the base this fold lands, so harvesting it again ran the source's effect twice - only a
// carrier whose stored VALUE lands owes that re-emission
let e = 0;
export const deleteLivePrefix = delete (e++, _globalThis).window;
export { e };
// NEGATIVE: a TERMINAL run is the value the source asked for and keeps every hop this build cannot
// spell; only a NAVIGATED one folds - the same split the read canon draws with the entry present
export const readRun = _globalThis.self.window;