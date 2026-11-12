import "core-js/modules/es.array.at";
// Building the optional receiver memo must not scope a type-only rest parameter.
const o: {
  p?: number[];
} | undefined = JSON.parse('{"p":[4,8]}');
const cb = (..._args: unknown[]) => {};
class Box {
  value = [o?.p?.at(-1), cb as (...xs: number[]) => void];
}
export const r = new Box().value;