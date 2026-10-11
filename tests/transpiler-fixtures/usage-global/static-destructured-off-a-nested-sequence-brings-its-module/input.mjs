// a static destructured off a sequence nested in a sequence reads the innermost tail, whose own parens
// the source keeps: every constructor a loop head can hold brings its module, and a key choosing between
// two statics brings both
for (const A of [Array, Set]) {
  const { fromAsync } = (a(), (b(), A));
  console.log(fromAsync);
}
const { [globalThis.c ? 'try' : 'withResolvers']: pick } = (a(), (b(), Promise));
export { pick };
