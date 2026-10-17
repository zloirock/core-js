// a PRISTINE proxy-global root reads through its pure import when it has one (`self`),
// bare when it does not (`window`); a pristine proxy HOP is pure navigation and drops
const { inner: { [Symbol.iterator]: viaSelf } } = self;
export { viaSelf };
