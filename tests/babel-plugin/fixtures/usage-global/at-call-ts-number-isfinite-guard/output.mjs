import "core-js/modules/es.number.is-finite";
function foo(x: string | number) {
  if (Number.isFinite(x)) {
    x.at(-1);
  }
}