// An effectful instance key with rest retains the native pattern.
// No extraction may bypass its exclusion or reorder the key and loop body.
const rows = [4, 9];
for (var {
    [(record(typeof method), 'at')]: method,
    ...rest
  } = rows, once = true; once; once = false) {
  use(method.call(rows, -1), rest[0], rest[1]);
}