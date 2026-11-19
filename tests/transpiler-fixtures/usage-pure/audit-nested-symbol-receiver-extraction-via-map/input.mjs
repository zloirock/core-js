// a missing-able CTOR root reads through its pure constructor
const { whatever: { [Symbol.iterator]: viaMap } } = Map;
export { viaMap };
