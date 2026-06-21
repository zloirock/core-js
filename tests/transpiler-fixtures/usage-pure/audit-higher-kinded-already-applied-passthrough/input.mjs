// HKT bound that is ALREADY applied: `Wrap<F> = F<number>; Already = Wrap<Array<string[]>>`.
// F binds to `Array<string[]>` whose inner is already set, so the rebuild must be skipped -
// else the `number` type-arg clobbers the nested-array inner. with the skip the bound stays
// Array<string[]>, so both chained `at()` hops narrow on an Array (not the generic fallback)
type Wrap<F> = F<number>;
type Already = Wrap<Array<string[]>>;
declare const xs: Already;
xs.at(0).at(0);
