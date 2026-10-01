// defaulted predicate parameter (`x = ''`) - the AssignmentPattern wrapper used
// to mask the inner Identifier, so the predicate's parameterName slot never
// matched and narrowing inside the `if` branch silently fell back to the union
function isStr(x: any = ''): x is string {
  return typeof x === 'string';
}
function f(x: number[] | string) {
  if (isStr(x)) return x.at(-1);
}
