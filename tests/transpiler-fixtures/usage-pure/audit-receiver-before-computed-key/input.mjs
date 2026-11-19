// ECMA evaluates a member call's RECEIVER before its computed key, and a member get runs user code
// whenever the property is an accessor - so "the receiver has no syntactic side effects" is not a
// reason to leave it after the harvested key effect. the receiver memo hoists ahead of that effect
globalThis.orderBox = { list: ['ab', 'cd'], n: 4 };
let k = 0;
export const memberReceiver = globalThis.window?.self.orderBox.list[(k++, 'at')](0);
export const memberReceiverPlain = globalThis.orderBox.list[(k++, 'at')](0);
export const deepMemberReceiver = globalThis.window?.self.orderBox.list[(k++, 'includes')]('a');

// A literal receiver is constructed before its computed key and reused for the call.
// An initialized, unchanged local binding can be read directly without a receiver capture.
const bound = ['ab', 'cd'];
export const literalReceiver = ['ab', 'cd'][(k++, 'at')](0);
export const bindingReceiver = bound[(k++, 'at')](0);
export { k };
