// `Symbol.iterator in complexRhs`: the iterability `in`-check must still recognise the
// well-known symbol on the LHS even when the RHS is a complex expression.
const k = Symbol.iterator;
const obj = { data: [1, 2, 3] };
k in obj.data;
