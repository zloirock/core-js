// NEGATIVE: no memo is needed in the body, so no scoped var is inserted and neither path runs
export const noScopedVar = (() => globalThis)()?.window?.String.fromCodePoint(99).endsWith('c');
