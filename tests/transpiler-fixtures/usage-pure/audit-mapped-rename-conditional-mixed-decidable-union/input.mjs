// matchesConditionalPattern with union extends-side: any-branch true wins, all-false is
// false, decidable-false + undecidable type-ref leaves the per-key rename indeterminate.
// `K extends 'items' | SomeRef` where SomeRef is a non-literal TypeReference:
// `K = 'items'`  - first branch matches literal -> rename = 'items', member emitted
// `K = 'other'`  - first branch false, second branch (SomeRef) undecidable -> dropped from
//                  the partial expansion (safe upper bound: never includes a key the rename
//                  would exclude). undecidable keys fall through to generic dispatch
//
// `r.items.at(0)` narrows to number[] -> `_atMaybeArray`. `r.other.includes('a')` doesn't
// get its mapped-type narrowing, so it falls through to the maybe-instance generic
// `_includes` polyfill - safe behaviour, just less precise
type SomeRef = number;
type Pick1<T> = { [K in keyof T as K extends 'items' | SomeRef ? K : never]: T[K] };
declare const r: Pick1<{ items: number[]; other: string }>;
r.items.at(0);
r.other.includes('a');
