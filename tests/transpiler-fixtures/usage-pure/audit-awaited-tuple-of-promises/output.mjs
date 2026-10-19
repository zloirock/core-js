// `Awaited<T>` unwraps only what `await` unwraps - an object with a callable `then` - and a tuple
// has none, so `Awaited<[Promise<X>, Promise<Y>]>` IS that tuple with its elements still promises.
// element access must therefore answer `Promise<X>` and dispatch generically: reading it as `X`
// handed an X-specific helper a Promise, which throws
async function tupleAwait() {
  type Pair = Awaited<[Promise<number[]>, Promise<string[]>]>;
  // @ts-expect-error a declaration inside a body, which tsc refuses, gives the row a value of a local type
  declare const p: Pair;
  const item = p[0];
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  item.at(0);
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  item.findLast(x => true);
}
tupleAwait();