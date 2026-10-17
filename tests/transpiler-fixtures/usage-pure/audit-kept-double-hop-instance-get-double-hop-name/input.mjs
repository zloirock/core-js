// A DOUBLE proxy hop under a kept assignment with an instance-GET tail: the erase-refusal claim fires INSIDE outer instance
// wrappers already built over the member, so the guard must climb above the whole wrapper stack - guarding only the wrapper's
// argument would hand `void 0` to the helper (a throw where native short-circuits the chain).
let n;
export const doubleHopName = (n = globalThis.window)?.self?.self.Set.name;
