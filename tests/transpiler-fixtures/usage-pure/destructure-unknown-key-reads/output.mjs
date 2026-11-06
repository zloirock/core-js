import _at from "@core-js/pure/actual/instance/at";
// Ordinary extraction serves the named read and retains the unknown native read.
// They stay independent even when the runtime key names the same property.
export function read(key, source) {
  const at = _at(source);
  const {
    [key]: other
  } = source;
  return [at, other];
}