import _includes from "@core-js/pure/actual/instance/includes";
// outer-scope `typeof x === 'string'` guard refers to the outer parameter, not
// the inner shadowed const. without binding-identity check at each guard scope,
// the outer guard wrongly narrows the inner unknown to string and dispatches
// the string-specific .includes - inner x is unrelated to the typeof check
declare function getValue(): unknown;
function outer(x: 1 | "two") {
  if (typeof x === "string") {
    const x: unknown = getValue();
    _includes(x).call(x, "a");
  }
}
outer(1);