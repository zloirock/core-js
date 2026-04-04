import "core-js/modules/es.array.at";
function f(x: object) {
  (x as string[]).at(-1);
}