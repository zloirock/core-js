// IIFE with a sequence-expression arg: `(0, Array)` evaluates to Array.
// synth-swap on the destructured `{ from }` should recognize the tail `Array`
// as the receiver even though the arg is wrapped in a comma-expression
const result = (({ from }) => from([1, 2, 3]))((0, Array));
export { result };
