// a chain-assignment root keeps its write and the unbacked `window` probe inside the guard test:
// guarding only the assigned realm value would run the branch where the source short-circuits. the
// test is the same with or without a memoized receiver, and a root whose every hop resolves keeps no
// guard at all - the write is the whole kept prefix and the leaf reads off the ponyfill.
let held, heldDeep, heldPlainHop, heldStatic, heldResolvable;
export const chainAssignInstance = (held = globalThis)?.window?.self?.Array.of(5).at(0);
export const chainAssignInstanceTwoHops = (heldDeep = globalThis)?.window?.window?.self?.Array.from([6]).includes(6);
export const chainAssignPlainHop = (heldPlainHop = globalThis).window?.window?.self?.Object.values({ v: 7 }).flat();
export const chainAssignStatic = (heldStatic = globalThis)?.window?.self?.Object.fromEntries([['s', 8]]);
export const chainAssignResolvableHops = (heldResolvable = globalThis)?.self?.Object.entries({ r: 9 }).findLast(r => r);
export { held, heldDeep, heldPlainHop, heldStatic, heldResolvable };
