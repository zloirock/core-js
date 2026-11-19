// A hoisted function can install a constructor before a textually earlier read.
let r;
let P = null;
init();
P.resolve(1);
r = typeof P.resolve;
function init() {
  P = Promise;
}
use(r);
