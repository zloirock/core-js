// `await import(\`core-js/...\`)` - dynamic import with no-interpolation TemplateLiteral.
// covers `importExpressionSource` path (separate from the `require()` path tested in
// audit-template-literal-entry). Both ImportExpression and the CallExpression form
// (`{type:'CallExpression', callee:{type:'Import'}}`) reach the same `extractStaticString`
// helper now, so a tagless template literal is recognised as an entry source
await import(`core-js/actual/promise`);
