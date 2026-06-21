// param destructure-default with TWO consecutive removed props at the HEAD (`from`, `of`)
// followed by a retained string-key sibling (`"z": z`). the second removal must consult the
// first so the shared comma isn't double-consumed (partial-overlap crash). IIFE form: a
// caller-lossy param emission is sound only with every call site visible (declared fn stays verbatim)
(function f({ from, of, "z": z } = Array) { return [from, of, z]; })();
