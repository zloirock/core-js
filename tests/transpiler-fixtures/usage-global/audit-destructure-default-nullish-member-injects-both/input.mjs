// usage-global twin of the nullish destructuring-member fold: the syntactically-present
// member value may be nullish, so the default stays live and BOTH families' entries
// inject. isolated from the sibling fold forms so its `.at` contribution is attributable
declare const maybe: string | undefined;
const { a = [7, 8] } = { a: maybe };
export const viaNullishMember = a.at(0);
