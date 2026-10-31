// Plain parameter and inner defaults synthesize covered keys even when an optional host is absent.
// Supplied arguments and logical-left branches preserve branch selection and their live static polyfills.
// Flat sealed reads still throw; unresolved sibling keys retain their receiver reads.
// Alias-held and nested defaults keep their fallback forms, and receiver effects run once.

// flat synth-swap, plain optional nav receiver
export function viaParamFlat({ of } = globalThis.window?.Array) { return of; }
