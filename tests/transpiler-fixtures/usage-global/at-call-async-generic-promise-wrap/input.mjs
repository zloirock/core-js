// @ts-expect-error an async function whose annotation omits the Promise is the shape under test
async function wrap<T>(x: T): T {
  return x;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrap('hello').finally(() => {});
