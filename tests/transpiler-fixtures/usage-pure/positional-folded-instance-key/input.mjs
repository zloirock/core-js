// A proven computed instance key is served after one iterator capture.
const K = 'at';
function* source(value) {
  yield value;
}
const [{ [K]: at }] = source([3, 7]);
export { at };
