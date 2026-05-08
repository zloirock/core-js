// Template `foo${string}` must still match `foo`-prefixed keys after the no-placeholder fix.
// Per-key narrowing routes Array vs String value types to their respective polyfill variants.
type Filter<T> = { [K in keyof T as K extends `foo${ string }` ? K : never]: T[K] };
declare const r: Filter<{ fooArr: number[]; fooStr: string; bar: boolean }>;
r.fooArr.at(0);
r.fooStr.includes('a');
