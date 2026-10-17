// A TS-cast-wrapped constructor mutation LHS through a proxy hop: the canonical write-host check climbs the
// cast wrapper, so the proxy hop collapses to the pure root instead of the LHS member whole-swapping to the
// imported `_Set` const (which would reassign a frozen import in strict ESM). a SE-key hop folds to its name +
// harvests the buried effect through the cast. distinct constructors per line.
let e = 0;
(globalThis.window.Set as any) = function () {};
(globalThis.self.Map as any) = function () {};
(globalThis[(e++, 'window')].WeakSet as any) = function () {};
