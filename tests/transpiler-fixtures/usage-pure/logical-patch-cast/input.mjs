// A type assertion wraps the write target, not its receiver.
// The served read prefers the polyfill; only the source fallback writes the slot.
(Array.prototype.flatMap as any) ??= () => ['fallback'];

export {};
