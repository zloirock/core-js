import _Promise$try from "@core-js/pure/actual/promise/try";
// an IIFE param-default whose winning call-arg is shadowed by an inner var of the same name
// still resolves the arg's static at the call site
export const viaIifeDefault = (({
  try: attempt
} = Array) => {
  var Promise;
  return attempt;
})({
  try: _Promise$try
});