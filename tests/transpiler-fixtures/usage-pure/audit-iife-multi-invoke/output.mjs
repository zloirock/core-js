import _Set from "@core-js/pure/actual/set/constructor";
// arrow assigned to const, called multiple times - findIifeCallSite walks parent chain
// looking for direct CallExpression callee. arrow declared via VariableDeclarator is NOT
// directly invoked by its definition site; so findIifeArgForParam must return null.
// param destructure here cannot rely on caller-arg substitution
const fn = ({
  from
}) => from;
fn(Array);
fn(_Set);