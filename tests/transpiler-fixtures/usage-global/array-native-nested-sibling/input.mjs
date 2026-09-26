// A native nested pattern stays before the typed method read of its sibling.
const events = [];
const item = { get at() { events.push('at'); return () => 3; }, get other() { events.push('other'); return 5; } };
const receiver = { get w() { events.push('w'); return item; }, y: 'abc' };
const [{ w: { at, other }, y: { includes } }] = [receiver, events.push('rhs')];
export { at, other, includes, events };
