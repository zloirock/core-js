// a SEAL under a TS wrapper: `(nav)!` and `(nav as any)` both parenthesize the nav, and the read
// above them performs the source's own read - it throws off-window. babel hangs the paren on the
// nav NODE (under the wrapper), so a predicate that stops one step short of it reads the seal as
// absent and erases that throw; oxc gives the same shape a ParenthesizedExpression node
export const sealedNonNullRead = (globalThis.window?.self)!.Symbol?.iterator;
