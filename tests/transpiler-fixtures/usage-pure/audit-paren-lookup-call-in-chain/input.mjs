// call in the middle of optional chain: `(getObj()?.a.includes)(1)`. extractCheck
// memoizes the call expression's receiver via _ref so getObj() evaluates once even
// across the deopt walk + paren-lookup throw guard
declare const getObj: () => { a: number[] } | null;
const r = (getObj()?.a.includes)(1);
