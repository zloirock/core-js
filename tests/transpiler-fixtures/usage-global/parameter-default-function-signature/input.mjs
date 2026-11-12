// Building the default's receiver memo must not scope a type-only object pattern.
const o: { p?: number[] } | undefined = JSON.parse('{"p":[4,8]}');
const cb = (..._args: unknown[]) => {};
export function read(value = [o?.p?.at(-1), cb as ({ x }: { x: number }) => void]) {
  return value[0];
}
