export function read(mark) {
  const s = globalThis.self;
  return [s?.[(mark(), 'self')].value, s === globalThis, globalThis.self === globalThis];
}
