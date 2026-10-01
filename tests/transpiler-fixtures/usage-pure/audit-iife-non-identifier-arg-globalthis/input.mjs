// IIFE invoked with `globalThis.Map` as the argument - a MemberExpression, not a bare
// Identifier. proxy-global access is statically classifiable to the leaf name (`Map`),
// so the IIFE-arg gets synth-swapped to a `{groupBy: _Map$groupBy}` literal exactly
// like bare `(({groupBy}) => ...)(Map)`. no AssignmentPattern fallback exists, so the
// permissive expanded receiver gate fires safely
(({ groupBy }) => groupBy([1, 2, 3], x => x))(globalThis.Map);
