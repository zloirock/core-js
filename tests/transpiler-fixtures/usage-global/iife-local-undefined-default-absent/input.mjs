export function absent(log) {
  { var undefined = void log.push('init'); }
  return (({ from } = Array) => from([4]))(undefined);
}
