// regression guard: TS inline type-only import `import { type Set, foo }` is already
// covered via `IMPORT_SPECIFIER_TYPES` check (all import-specifier positions return
// false regardless of `importKind`). the value import `foo` passes through unchanged,
// the type import `Set` neither triggers a polyfill nor gets renamed
import { type Set, foo } from 'bar';
foo.at(0);
