// A local undefined value supplies the argument instead of selecting the default.
export function read() {
  { var undefined = Array; }
  return (({ from } = Object) => from([4]))(undefined);
}
