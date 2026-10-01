async function f() { const arr = await Promise.allSettled(p); return arr.at(-1); }
