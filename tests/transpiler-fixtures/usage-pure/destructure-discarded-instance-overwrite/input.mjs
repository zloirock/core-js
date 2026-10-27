// The instance dispatch reuses its literal slot. Other initializer effects still
// run before the overwrite after the nested assignment pattern has disappeared.
const events = [];
const values = [7, 8];
let read;
({ y: { at: read } } = { before: events.push('before'), y: values, after: events.push('after') });
export { read, events };
