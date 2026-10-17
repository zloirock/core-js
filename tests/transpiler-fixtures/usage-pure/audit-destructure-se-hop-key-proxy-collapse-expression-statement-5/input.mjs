let i = 0;
const k = globalThis;
const { entries } = k[(i++, 'self')].Object;
entries({ y: 2 });
