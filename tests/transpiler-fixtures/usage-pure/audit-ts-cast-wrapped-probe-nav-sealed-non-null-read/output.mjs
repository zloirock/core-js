import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a SEAL under a TS wrapper: `(nav)!` and `(nav as any)` both parenthesize the nav, and the read
// above them performs the source's own read - it throws off-window. babel hangs the paren on the
// nav NODE (under the wrapper), so a predicate that stops one step short of it reads the seal as
// absent and erases that throw; oxc gives the same shape a ParenthesizedExpression node
export const sealedNonNullRead = ((null == _globalThis.window ? void 0 : _self).Symbol, _Symbol$iterator);