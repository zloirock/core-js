import "core-js/modules/es.array.iterator";
export function first(xs) {
  for (const x of xs) return x;
}