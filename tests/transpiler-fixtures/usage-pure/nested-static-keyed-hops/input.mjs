// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const events = [];
var { [(events.push('realm'), 'Array')]: { [(events.push(typeof from), 'from')]: from } } = globalThis;
var { [(events.push('literal'), 'w')]: { [(events.push(typeof of), 'of')]: of } } = { w: Array };
export const result = [from([7])[0], of(8)[0], events];
