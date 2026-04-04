import "core-js/modules/es.string.at";
function foo(x) {
  if (typeof x !== 'string' && typeof x !== 'number' && typeof x !== 'bigint') {
    return;
  } else {
    x.at(-1);
  }
}