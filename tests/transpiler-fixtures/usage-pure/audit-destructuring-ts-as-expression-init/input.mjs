// destructure with TS `as` cast on init expression: the cast is peeled and the
// destructure receivers route through pure-mode polyfills normally.
const { at } = arr as number[];
