import "core-js/modules/es.array.find";
function unshadowed<T extends number[]>(x: T) {
  return x.find(n => n > 0);
}