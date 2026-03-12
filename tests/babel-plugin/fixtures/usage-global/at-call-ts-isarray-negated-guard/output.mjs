import "core-js/modules/es.string.at";
function foo(x: string | number[]) {
  if (!Array.isArray(x)) {
    x.at(-1);
  }
}