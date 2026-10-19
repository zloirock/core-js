// Conditional rename `K extends 'items' | SomeRef` mixes a decidable literal with an undecidable type-ref.
// Decidable keys keep their array narrow; undecidable keys must drop to generic dispatch as a safe upper bound.
type SomeRef = number;
type Pick1<T> = { [K in keyof T as K extends 'items' | SomeRef ? K : never]: T[K] };
declare const r: Pick1<{ items: number[]; other: string }>;
r.items.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r.other.includes('a');
