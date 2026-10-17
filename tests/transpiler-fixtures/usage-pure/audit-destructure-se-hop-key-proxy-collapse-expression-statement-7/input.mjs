let n = 0;
const { resolve } = globalThis[(n++, 'self')].Promise;
resolve(1);
