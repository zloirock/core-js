// `import type { X }` - declaration-level `importKind: 'type'` flag lives on the
// ImportDeclaration, not on the inner ImportSpecifier. plugin must recognise this as a
// type-only position and NOT inject a polyfill - identifier resolves to a type alias only,
// has no runtime binding (TS strips the import at compile time)
import type { Set } from './types';
declare const x: Set<number>;
x.size;
