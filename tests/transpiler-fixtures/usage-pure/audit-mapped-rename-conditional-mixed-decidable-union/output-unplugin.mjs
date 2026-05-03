import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
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
_atMaybeArray(_ref = r.items).call(_ref, 0);
_includes(_ref2 = r.other).call(_ref2, 'a');