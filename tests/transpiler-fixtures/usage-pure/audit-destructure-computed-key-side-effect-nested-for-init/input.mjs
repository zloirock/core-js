// a NESTED side-effecting computed key in a FOR-INIT declarator. a loop header can't host a preceding
// statement, so the residual binds the polyfill as a SIBLING declarator in the header instead (the key
// stays in place, effect once). both emitters agree (no sidecar). regression: unplugin crashed / dropped
for (const { x: { [(effectful(), 'from')]: f } } = { x: Array }; cond; ) use(f);
