// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { keys, ...restA } }] = ([globalThis]);
const { Object: { values, ...restB } } = (globalThis);
const [{ Object: { entries, ...restC } }] = ([(eff('a'), globalThis)]);
export { keys, restA, values, restB, entries, restC, seen };
