import _includes from "@core-js/pure/actual/instance/includes";
// compound-assign variant of test-tail mutation: `+= ...` is still a constantViolation
// for the binding. soundness must bail just like a plain `=` reassignment even though
// the runtime type may not actually change (string += string stays string)
let x: string | number[] = "hi";
if (typeof x === "string" && (x += "world", true)) {
  _includes(x).call(x, 1);
}