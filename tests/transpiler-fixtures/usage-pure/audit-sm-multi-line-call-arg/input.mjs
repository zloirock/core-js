// source map mapping for a call whose argument spans multiple lines: each line of
// the arg must keep its source position.
function pull() {
  const list = Array.from(
    new Set([1, 2, 3, 4]),
    x => x * 2,
  );
  return list;
}
