// Suspended user values are evaluated once before the nested instance read.
async function read(source) {
  const { list: { at } } = await source;
  const { list: { includes } } = (note(), await source);
  return [at, includes];
}
function* resume() {
  const { list: { flat } } = yield 1;
  return flat;
}
