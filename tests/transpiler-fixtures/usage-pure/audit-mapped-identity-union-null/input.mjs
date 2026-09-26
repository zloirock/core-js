// `{ [K in keyof Source]: Source[K] | null }` keeps array shape; the optional chain peels the null branch.
// Per-key narrowing must still pick array polyfills despite the union body.
type Source = {
  items: number[];
  tags: string[];
};
type Wrapped = { [K in keyof Source]: Source[K] | null };
declare const target: Wrapped;
target.items?.at(0);
target.tags?.findLast(t => t.length > 1);
