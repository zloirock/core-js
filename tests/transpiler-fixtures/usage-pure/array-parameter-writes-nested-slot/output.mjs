// A destructured parameter can replace a slot inside the captured array element.
// The later nested read must keep the replacement's method.
const source = [{
  w: Array
}];
function install([held]) {
  held.w = {
    from: x => x
  };
}
install(source);
const [{
  w: {
    from
  }
}] = source;
use(from([1]));