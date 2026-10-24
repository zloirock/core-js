// top-level destructure `{ Array } = globalThis` aliases the Array global; subsequent
// `.from(...)` on the alias must route through the polyfill.
const { Array: MyArr } = globalThis;
MyArr.from([1, 2, 3]);
