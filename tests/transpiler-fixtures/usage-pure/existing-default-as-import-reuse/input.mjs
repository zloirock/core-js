// `import { default as X } from 'pkg'` is a valid ESM alias for the default export and
// equivalent to `import X from 'pkg'`; the rewrite must reuse the existing local binding
// for `Array.from` rather than emitting a duplicate import.
import { default as _Array$from } from '@core-js/pure/actual/array/from';
Array.from(x);
