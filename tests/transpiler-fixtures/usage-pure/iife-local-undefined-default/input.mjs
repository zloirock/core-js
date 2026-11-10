// Empty/void var runs the default; writes, loop values and TDZ do not prove an absent argument.
export function empty() {
  { var undefined; }
  return (({ from } = Array) => from([4]))(undefined);
}
export function absent(log) {
  { var undefined = void log.push('init'); }
  return (({ from } = Array) => from([4]))(undefined);
}
export function written(value) {
  { var undefined; }
  undefined = value;
  return (({ from } = Array) => from([4]))(undefined);
}
export function loop(values) {
  for (var undefined of values) (({ from } = Array) => from([4]))(undefined);
}
export function lexical() {
  try {
    (({ from } = Array) => from([4]))(undefined);
    let undefined;
  } catch (error) {
    return error.name;
  }
}
