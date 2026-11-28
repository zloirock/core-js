import "core-js/modules/es.string.at";
type Wrap<T> = {
  v: T;
};
declare const n: number;
function w<T = number[]>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
w(`a${n}b`).v.at(0);