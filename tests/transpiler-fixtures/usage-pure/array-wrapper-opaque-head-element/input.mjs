// An effectful constructor key and an opaque instance leaf share one array capture.
// The static claims are served without repeating the key or losing the native length read.
export function read(unknown) {
  const log = [];
  for (const e of [Array]) {
    const [{ [(log.push('k'), 'of')]: of, fromAsync: from }, { at, length }] = [e, unknown];
    use(of, from, at, length);
  }
  return log;
}
