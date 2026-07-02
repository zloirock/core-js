import "core-js/modules/es.number.is-finite";
function foo(x) {
  if (Number.isFinite(x)) {
    x.at(-1);
  }
}