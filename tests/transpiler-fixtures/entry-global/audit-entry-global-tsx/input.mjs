// entry-global mode through TSX file: `import 'core-js/actual'` expands to per-feature
// modules. parserOpts (typescript+jsx) must not interfere with entry rewrite
import 'core-js/actual';
type Item = { id: number };
const view: Item[] = [{ id: 1 }];
const items = view;
items.flat();
