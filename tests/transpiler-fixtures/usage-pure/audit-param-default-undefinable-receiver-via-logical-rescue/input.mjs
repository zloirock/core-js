// The logical left keeps its nullish branch so the rescue still runs when the host is absent.
export function viaLogicalRescue({ of } = globalThis.window?.Array ?? {}) { return of; }
