// A sequence prefix remains ahead of the call and its native array iteration.
// Both the optional call and literal-array twin keep native static reads and element defaults.
const log = [];
const make = () => (log.push('make'), [Math]);
const [{ trunc: viaPrefixed } = {}] = (log.push('prefix'), make());
const [{ sign: viaOptional } = {}] = make?.();
const [{ cbrt: viaLiteral } = {}] = (log.push('literal'), [Math]);
export { viaPrefixed, viaOptional, viaLiteral, log };
