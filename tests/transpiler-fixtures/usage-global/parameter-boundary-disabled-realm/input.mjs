// The enabled static is supplied; the disabled constructor keeps its native identity.
export function read({ Array: { from },
  // core-js-disable-next-line
  Set: S
} = globalThis) { return [from, S]; }
