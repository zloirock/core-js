// `Awaited<A & B>` over plain objects must return the intersection unchanged (no Promise to peel).
// Member lookup through the intersection must find each branch's array field for per-key narrowing.
async function objs() {
  type T = { items: number[] } & { tags: string[] };
  // @ts-expect-error a declaration inside a body, which tsc refuses, gives the row a value of a local type
  declare const r: Awaited<T>;
  r.items.at(0);
  r.tags.includes('x');
}
objs();
