// JSX with spread attributes and Array.from inside. Both parsers handle JSX node types
// (JSXElement, JSXAttribute, JSXSpreadAttribute, JSXExpressionContainer); side-effect
// detection treats spread as SE and the polyfill should still inject for Array.from
function App({ items }) {
  const list = Array.from(items);
  return <ul {...{ id: 'list' }}>{list.at(0)}</ul>;
}
App({ items: [1, 2, 3] });
