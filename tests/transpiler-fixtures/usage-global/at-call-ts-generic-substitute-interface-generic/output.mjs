import "core-js/modules/es.array.at";
interface MyList<T> extends Array<T> {}
function wrap<T>(x: T): MyList<T> {
  return [x] as MyList<T>;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrap('hello').at(-1).toFixed(2);