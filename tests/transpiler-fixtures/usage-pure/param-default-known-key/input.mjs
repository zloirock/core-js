// A proven non-colliding string key retains its read beside the method extraction.
const key = 'length';
export function read({ at, [key]: other } = [7]) {
  return [at, other];
}
