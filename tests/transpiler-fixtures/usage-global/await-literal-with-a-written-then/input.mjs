// an await hands a value on only where it is no thenable, and a `then` the FILE writes onto
// `Object.prototype` makes every literal one - an array too: each container below is resolved
// through that `then` rather than handed on, so neither flavor names the value it reads a static
// off - pure keeps the read native, usage-global injects nothing for it (the array pattern's own
// lowering still takes `es.array.from`)
Object.prototype.then = function (done) {
  delete Object.prototype.then;
  done({ a: Set });
};
const record = () => ({ a: Array });
const list = () => [Promise];
export async function viaRecord() {
  const { a: A } = await record();
  return A.of(1);
}
export async function viaList() {
  const [P] = await list();
  return P.withResolvers();
}
