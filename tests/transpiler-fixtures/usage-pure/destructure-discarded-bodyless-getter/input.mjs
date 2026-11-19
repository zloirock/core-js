// A consumed assignment still reads its getter exactly once inside the branch.
// Keeping the read also keeps the sequence prefix ahead of it.
const events = [];
const source = { get constructorValue() { events.push('getter'); return Object; } };
let read;
if (take) ({ values: read } = (events.push('prefix'), source.constructorValue));
export { read, events };
