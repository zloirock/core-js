// inline TS type-only import specifier `import { type Set, foo }`. the `type` prefix
// marks `Set` as a type-level import that's erased at runtime; the value import `foo`
// stays as-is. no polyfill should be injected for the type-only `Set` binding and
// nothing should be renamed; only `foo.at(0)` gets the instance polyfill
import { type Set, foo } from 'bar';
foo.at(0);