// An effectful constructor element retains its call beside an opaque prototype default.
// The instance leaf keeps generic dispatch while the static retains its substitution.
export function read(unknown) {
  const log = [];
  function make() { log.push('make'); return Array; }
  for (const { fromAsync: from, prototype: { at, length } = unknown } of [make()]) use(from, at, length);
  return log;
}
