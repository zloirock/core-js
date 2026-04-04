import "core-js/modules/es.string.at";
function foo(x) {
  if (typeof x !== 'string') {
    if (Math.random()) {
      throw new Error('not string');
    } else {
      return;
    }
    console.log('unreachable');
  }
  x.at(-1);
}