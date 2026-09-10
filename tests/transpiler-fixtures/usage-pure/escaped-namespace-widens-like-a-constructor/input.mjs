// a namespace handed OUT owes its family exactly as an escaped constructor does: the holder reads
// statics off it, and the bare object entry installs none - every one of them answers `undefined` on
// the floor this build targets. the widen reads BOTH narrow spellings, and a namespace global names
// its bare object `<x>/namespace` where a constructor names its binding `<x>/constructor`; asking
// only for the second shipped the stub. `Reflect` is the one namespace this build gives an entry
export const escaped = Reflect;
