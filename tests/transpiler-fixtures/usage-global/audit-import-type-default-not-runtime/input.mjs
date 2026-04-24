// `import { type default as P }` - type-only default specifier. defaultSpecifierNames
// now skips `importKind: 'type'` per specifier, so no runtime hint registration occurs
// for P. the actual polyfill behaviour is unaffected: type-only imports compile-away
import { type default as P } from 'some-package';
declare const p: P;
p.at(-1);
