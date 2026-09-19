// receiver-rewrite on Promise.try (stage 4 / ES2026 static):
// `function f({try: t} = Promise)`. `try` is a reserved word so the destructure uses the
// `try: t` alias form. The default is rewritten to `{try: _Promise$try}` - covers a
// reserved-word key in alias destructure
function f({ try: t } = Promise) { return t; }
f();
