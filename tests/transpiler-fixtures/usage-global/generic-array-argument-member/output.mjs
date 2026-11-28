import "core-js/modules/es.array.at";
type Wrap<T> = {
  v: T;
};
function ws<T = string>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
ws([new Date()]).v.at(0);