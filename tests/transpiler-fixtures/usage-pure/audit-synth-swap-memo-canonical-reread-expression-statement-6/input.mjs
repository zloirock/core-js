// a kept prefix composes its own inner rewrites: the global read inside the surviving
// side effect substitutes even though the navigation around it is erased
function innerGlobal({ groupBy: g4, none } = (globalThis.tick(), globalThis.Map) || null) { return [g4, none]; }
innerGlobal();
