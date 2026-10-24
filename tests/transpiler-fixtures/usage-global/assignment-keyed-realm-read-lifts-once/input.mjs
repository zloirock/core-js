// A fully consumed destructuring ASSIGNMENT whose init is a realm read under an effectful KEY: this method
// rewrites no init, so each read and its key's effect stay where the source wrote them, and every static
// the rows read keeps its module.
let c = 0;
let of, fromEntries, groupBy;
({ of } = globalThis[(c++, 'Array')]);
({ fromEntries } = globalThis[(c++, 'Object')]);
({ groupBy } = globalThis[(c++, 'Map')]);
export { of, fromEntries, groupBy, c };
