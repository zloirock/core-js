// An effectful parameter key stays at its original evaluation point.
export function read({
  [(effect(), 'at')]: at
}) {
  return at;
}