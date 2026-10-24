// A returned assignment keeps the chosen object while the binding receives its static.
export function read(shim) {
  let resolve;
  function capture() { return { resolve } = shim || Promise; }
  return [capture(), resolve];
}
