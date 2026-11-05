// Removing a core-js import must not fuse adjacent statements into a call or indexing expression.
// Guard renders and native array assignments retain the required statement separator.
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
