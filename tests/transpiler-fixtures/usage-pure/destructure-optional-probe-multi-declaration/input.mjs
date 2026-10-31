// Sibling initializers surround one guarded key effect.
const log = [];
const before = (log.push('before'), 1),
  { of } = globalThis.window?.[(log.push([7].at(0)), 'Array')],
  after = (log.push('after'), 2);
export const result = [before, of(3), after, log];
