// An `await using` declaration whose body explicitly reads a shadowed-global static. The async-dispose
// scaffolding is keyed on the declaration kind, so it lands regardless; but `Symbol` here is a local
// parameter binding, so the explicit `Symbol.for` static must NOT be polyfilled - the global Symbol
// statics stay out of the import set.
async function main(Symbol) {
  await using resource = getAsyncResource();
  Symbol.for('resource-key');
}
