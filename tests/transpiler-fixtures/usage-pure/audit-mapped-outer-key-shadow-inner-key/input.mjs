// Outer mapped's `K` shadows the inner mapped's `K`; substitution must drop the shadowed key before recursing.
// Without alpha-rename, the outer `K -> 'a'` binding would corrupt the inner mapped expansion.
type Inner<T> = { [K in keyof T]: T[K] };
type Wrap<T> = { [K in keyof T]: Inner<{ ['nested_' + K]: T[K] }> };
declare const r: Wrap<{ items: number[]; tail: string[] }>;
r.items.nested_items.at(0);
r.tail.nested_tail.includes('a');
