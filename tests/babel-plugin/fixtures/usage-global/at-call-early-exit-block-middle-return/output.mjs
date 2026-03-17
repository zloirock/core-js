import "core-js/modules/es.string.at";
function foo(x) {
  if (typeof x !== 'string') {
    return;
    console.log('unreachable');
  }
  x.at(-1);
}