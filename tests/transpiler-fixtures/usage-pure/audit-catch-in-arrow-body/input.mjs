// catch destructure inside an arrow function body: pattern bindings still route
// through pure-mode instance-method polyfills when used in the body.
const f = (x) => { try {} catch ({ includes }) { return includes(x); } };
