// A quiet identity call names the same realm hop as its literal argument.
export function read() {
  const key = value => value;
  return globalThis[key("self")].Array.from([3]);
}
