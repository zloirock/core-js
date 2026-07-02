// destructuring with TS-cast init `const { x } = obj as any`: the cast peels away
// and the destructure receivers route through the polyfill rewrites normally.
const { from } = Array as any;
const { resolve } = Promise satisfies any;
