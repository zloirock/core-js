// Computed-key destructuring assignments preserve receiver coercion before key effects.
// Sealed and live optional receivers keep their throwing and short-circuit boundaries.
let ca = 0;
let viaProbeAssignSeKey;
({ [(ca++, 'keys')]: viaProbeAssignSeKey } = globalThis.window?.self.Object);
export { viaProbeAssignSeKey };
export { ca };
