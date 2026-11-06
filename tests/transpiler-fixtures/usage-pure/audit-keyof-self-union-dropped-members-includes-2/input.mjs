interface WithGetter {
  get size(): string[];
  zs: string[];
}
declare const g2: WithGetter[keyof WithGetter];
export const r4 = g2.includes("z");
