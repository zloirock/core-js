// `await import(\`core-js/...\`)` - dynamic import with a no-interpolation template
// literal as the source. Covers the import-expression path (separate from the
// `require()` path tested in `audit-template-literal-entry`). Both syntactic forms
// (the dedicated import expression and the call-expression form) flow through the same
// static-string extraction, so a tagless template literal is recognised as an entry source
await import(`core-js/actual/promise`);
