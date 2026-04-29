// receiver-rewrite bails when the default is a template literal:
// `function f({try: t} = `Promise`)`. The template literal evaluates to a string at
// runtime, not a constructor - destructuring `try` from a string yields undefined.
// The receiver classifier requires a bare-identifier shape; a template literal fails.
// The plugin emits the source as-is, and `t` is undefined at runtime
function f({ try: t } = `Promise`) { return t; }
f();
