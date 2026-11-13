// Mirroring a constructor does not serve its disabled static sibling.
export function read({ from,
  // core-js-disable-next-line
  of
} = Array) { return [from, of]; }
