// Const-bound `wrapper = { a: Array }` exposes a static-object descent path through `{ a: { from } }`.
// Constructor leaf must resolve to Array so both polyfill emit and downstream instance narrowing fire.
const wrapper = { a: Array };
const { a: { from } } = wrapper;
const arr = from('hi');
arr.at(0);
arr.includes('h');
