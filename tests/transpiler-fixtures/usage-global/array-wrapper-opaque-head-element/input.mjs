// A captured wrapper retains its effectful static key beside an opaque instance leaf.
// Narrowing the constructor cannot shed the capture or duplicate the key evaluation.
export function read(unknown) {
  const log = [];
  for (const e of [Array]) {
    const [{ [(log.push('k'), 'of')]: of, fromAsync: from }, { at, length }] = [e, unknown];
    use(of, from, at, length);
  }
  return log;
}
