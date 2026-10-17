// IIFE-identity receiver resolution must peel runtime-transparent wrappers off the body's
// returned node before the identity-lift: oxc preserves the `(a)` paren / SE tail that babel
// strips at parse, in both expression-body and block-body returns. without the peel the
// destructured static loses its narrow -> no polyfill (unplugin). distinct ie11-absent statics
const { from } = (a => (a))(Array);
const { of } = (a => (0, a))(Array);
const { assign } = (a => { return (a); })(Object);
from([1]);
of(2);
assign({}, {});
