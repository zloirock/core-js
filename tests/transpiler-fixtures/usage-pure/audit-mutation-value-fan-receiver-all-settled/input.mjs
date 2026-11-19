const registry = { Promise };
const k = "Promise";
registry[k].allSettled = patchD;
const r4 = Promise.allSettled(list);
export { r4 };
