// synth-swap bails when default is template literal: `function f({try: t} = `Promise`)`.
// template literal evaluates to a string at runtime, not a constructor - destructuring
// `try` from a string yields undefined. isClassifiableReceiverArg requires Identifier
// shape; template literal fails. plugin emits as-is, runtime t is undefined
function f({
  try: t
} = `Promise`) {
  return t;
}
f();