// A consumed assignment yields its selected receiver and dispatches the named static.
// A caller-supplied object's own slot keeps its value.
export function read(shim) {
  let from;
  const host = { from } = shim || Array;
  return [host, from];
}
