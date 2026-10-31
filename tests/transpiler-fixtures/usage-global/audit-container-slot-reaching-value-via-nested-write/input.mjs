// a written value reached through a NESTED container descends the remaining path too
const inner = { g: Object };
const host = { k: inner };
inner.g = Promise;
const { k: { g: { allSettled: viaNestedWrite } } } = host;
export { viaNestedWrite };
