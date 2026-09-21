// Object.assign evaluates the getter once and installs its fresh custom receiver.
// The previous Array value cannot reach the later call.
const box = { value: Array };
Object.assign(box, { get value() { effect(); return { from: () => 'custom' }; } });
function read(held) { return held.from([1]); }
read(box.value);
