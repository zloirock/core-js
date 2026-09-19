async function f() { const arr = await Promise.all(promises); return arr.at(-1); }
