// walkStaticReceiverChain bail: intermediate alias declared with `let` (mutable). The
// shared walker checks adapter.getBindingNodeType returns 'VariableDeclarator' AND that
// constantViolations is empty; reassignable bindings break the static-shape contract.
// Without proper static narrow, `arr.findLast` / `arr.at` / `arr.includes` should still
// emit polyfills but via generic instance-method shapes, not array-narrowed
let A = Array;
const { from } = A;
const arr = from('hi');
arr.findLast(c => c);
arr.at(-1);
arr.includes('h');
