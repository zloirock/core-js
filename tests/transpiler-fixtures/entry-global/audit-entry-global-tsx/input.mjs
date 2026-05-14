// entry-global mode through real TSX content: `import 'core-js/actual'` expands to
// per-feature modules. parserOpts (typescript+jsx) must not interfere with entry
// rewrite when TS types AND JSX tags coexist in the same file
import 'core-js/actual';
type Props = { id: number; tag: string };
const view: Props[] = [{ id: 1, tag: 'a' }];
const items = view;
items.flat();
function Card({ id, tag }: Props) {
  return <span data-id={id}>{tag}</span>;
}
Card(view[0]);
