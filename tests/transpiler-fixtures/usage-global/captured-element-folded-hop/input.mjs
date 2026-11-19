// A bound key below the captured element names its nested receiver.
const Y = 'y';
export function read(source) {
  const [{ [Y]: { at }, length }] = source;
  return [at, length];
}
