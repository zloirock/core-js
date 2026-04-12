async function f() { const arr = await Promise.all(p); return arr.at(-1); }
