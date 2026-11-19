var G = globalThis;
export function viaCtor(flag) {
  if (flag) { var G = globalThis; }
  return G.Array.from([2]);
}
export const c = [viaCtor(true)];
