// optional proxy chains in a body-extracted param default collapse onto the substituted
// root with exactly ONE connector: an optional ROOT connector belongs to the root rewrite
// (it emits `_globalThis.`), so the hop deletion starts past it; a plain root re-establishes
// the `.` itself. a COMPUTED leaf collapses too (no connector at all) - keeping the hop
// verbatim would read `.self` off the global object, undefined on hosts without it
export function f({ from, ...rest } = globalThis?.self?.Array) { return [from, rest]; }
export function g({ of: o, ...r2 } = globalThis.self?.Array) { return [o, r2]; }
export function h({ keys, ...r3 } = (globalThis)?.self.Object) { return [keys, r3]; }
export function k({ entries, ...r4 } = globalThis.self['Object']) { return [entries, r4]; }
export function n({ groupBy: g2, ...r5 } = globalThis?.self?.['Map']) { return [g2, r5]; }
