// ConditionalExpression (ternary) form: parent.test slot mutation - same shape as
// IfStatement test-tail but via `cond ? a : b` host. the test-tail mutation check must
// recognise ConditionalExpression alongside IfStatement and bail
function probe(): boolean {
  let x: string | number[] = "hi";
  return typeof x === "string" && (x = [1, 2, 3], true) ? x.includes(1) : false;
}
probe();
