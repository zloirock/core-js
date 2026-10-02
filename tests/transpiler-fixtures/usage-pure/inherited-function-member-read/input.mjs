// Pristine Object.prototype methods are Function values on an ordinary literal.
// A nested instance read must not inject array, string or iterator methods.
use(({}).toString.at);
const box = {};
use(box.hasOwnProperty.includes);
const {
  valueOf: {
    some
  }
} = {};
use(some);
