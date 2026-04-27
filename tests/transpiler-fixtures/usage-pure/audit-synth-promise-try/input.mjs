// synth-swap on Promise.try (stage 4 / ES2026 static): `function f({try: t} = Promise)`.
// `try` is reserved word so destructure uses `try: t` alias form. synth-swap rewrites
// the default to `{try: _Promise$try}` - covers reserved-word key in alias destructure
function f({ try: t } = Promise) { return t; }
f();
