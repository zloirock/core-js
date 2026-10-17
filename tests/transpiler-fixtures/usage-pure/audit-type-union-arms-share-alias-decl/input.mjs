// the alias walk carries a decl-set so a recursive type stops instead of burning depth, and that set
// is inherited by the arms of a union it reaches. scoped to the whole walk rather than to the current
// descent, the first arm leaves its alias in the set and the second arm reads as a cycle: it answers
// null, one null arm folds the whole union to null, and a receiver that is plainly an array widens to
// the generic helper. the two rows differ ONLY in whether the arms go through the SAME alias
// declaration, so both must narrow and no string leg may appear
type Wrap<T> = T[];
type Other<T> = T[];
type SharedArms = Wrap<string[]> | Wrap<Array<string>>;
type DistinctArms = Wrap<string[]> | Other<Array<string>>;

declare const shared: SharedArms;
declare const distinct: DistinctArms;

// both arms resolve through the SAME declaration: re-entering it is not recursion, it is the sibling
export function armsShareOneAliasDecl() {
  return shared.at(0).at(0);
}

// the control: one declaration per arm, so nothing can be re-entered either way
export function armsUseDistinctAliasDecls() {
  return distinct.at(0).includes("x");
}
