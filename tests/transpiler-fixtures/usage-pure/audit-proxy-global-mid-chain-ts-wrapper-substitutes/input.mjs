// `((globalThis as any).X).Y.at?.(0)` - a TS `as` cast sits mid-chain. The cast is peeled
// to reach the globalThis root so it is substituted to the polyfill; otherwise the receiver
// keeps a bare globalThis that ReferenceErrors in engines lacking it before the polyfill runs.
((globalThis as any).X).Y.at?.(0);
