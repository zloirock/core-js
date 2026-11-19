// Outer mapped's `K` shadows the inner mapped's `K`; substitution must drop the shadowed key before recursing.
// Without alpha-rename, the outer `K -> 'a'` binding would corrupt the inner mapped expansion.
type Inner<T> = { [K in keyof T]: T[K] };
// @ts-expect-error a computed key tsc refuses is the shape under test
type Wrap<T> = { [K in keyof T]: Inner<{ ['nested_' + K]: T[K] }> };
declare const r: Wrap<{ items: number[]; tail: string[] }>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r.items.nested_items.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r.tail.nested_tail.includes('a');
