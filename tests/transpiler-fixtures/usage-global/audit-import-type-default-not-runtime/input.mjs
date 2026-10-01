// type-only default specifier `import { type default as P }` is compile-away and does not
// register a runtime alias for `P`. The standalone `p.at(-1)` instance call still polyfills.
import { type default as P } from 'some-package';
declare const p: P;
p.at(-1);
