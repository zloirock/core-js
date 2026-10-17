import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
interface WithGetter {
  get size(): string[];
  zs: string[];
}
declare const g2: WithGetter[keyof WithGetter];
export const r4 = _includesMaybeArray(g2).call(g2, "z");