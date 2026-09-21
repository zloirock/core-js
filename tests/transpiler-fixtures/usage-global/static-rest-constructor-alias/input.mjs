// A constructor alias used as a rest source requires the full family.
const Source = Promise;
const { resolve, ...rest } = Source;
const same = Source === Promise;
export { resolve, rest, same };
