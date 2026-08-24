// composition of two destructure pipelines over one declarator: the array-wrapped static
// extract claims the literal-keyed prop (preceding decl + rest sentinel), the symbol-key
// handling rebuilds the declarator - the rebuild must render the claimed prop VERBATIM
// so the claimer's own rewrites land in it (a re-consume double-sentinels the prop)
const [{ 'from': f, [Symbol.iterator]: it, ...r }] = [Array];
f([1]);
it;
r;
