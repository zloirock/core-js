// Neither constructor has an `at` method; this read must not inject instance `at` polyfills.
export function read(flag) {
  const [{
    at
  }] = [flag ? Array : Object];
  return at;
}