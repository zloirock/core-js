// The captured array binds its method before the following property is read.
export function read(obj) {
  let at, y;
  ({ list: [{ at }], y } = obj);
  return [at, y];
}
