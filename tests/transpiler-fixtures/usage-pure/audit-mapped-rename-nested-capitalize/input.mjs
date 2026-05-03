// evalRenameTemplate: nested intrinsic `Capitalize<Uppercase<K>>` - both
// transformers are recognized and composed. Source key 'items' should map
// to 'ITEMS' uppercased then capitalized (still 'ITEMS')
type Pretty<T> = { [K in keyof T as Capitalize<Uppercase<K & string>>]: T[K] };
declare const r: Pretty<{ items: number[]; name: string[] }>;
r.ITEMS.at(0);
r.NAME.findLast(x => true);
