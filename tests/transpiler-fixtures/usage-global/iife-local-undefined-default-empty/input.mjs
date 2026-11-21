export function empty() {
  { var undefined; }
  return (({ from } = Array) => from([4]))(undefined);
}
