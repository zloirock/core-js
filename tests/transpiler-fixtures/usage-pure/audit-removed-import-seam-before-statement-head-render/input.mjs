// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
let from;
export let x = 4
import 'core-js/modules/es.array.from';
globalThis.window?.self.hostBox.field + 1;
export let y = 5
import 'core-js/modules/es.array.at';
[{ Array: { from } }] = [(+eff(), globalThis)];
export let z = 6
import 'core-js/modules/es.array.of';
[1].at(0);
export { from };
