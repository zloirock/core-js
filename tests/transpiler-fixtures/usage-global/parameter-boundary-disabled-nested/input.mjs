// An opt-out belongs to its own leaf, including in a moved nested pattern.
export function read({ row: { at,
  // core-js-disable-next-line
  flat
}, marker }) { return [at, flat, marker]; }
