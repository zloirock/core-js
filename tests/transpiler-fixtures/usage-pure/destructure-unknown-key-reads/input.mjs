// Ordinary extraction serves the named read and retains the unknown native read.
// They stay independent even when the runtime key names the same property.
export function read(key, source) {
  const { at, [key]: other } = source;
  return [at, other];
}
