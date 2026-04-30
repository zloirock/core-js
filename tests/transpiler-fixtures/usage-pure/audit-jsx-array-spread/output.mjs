import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// JSX with spread attributes and Array.from inside. Both parsers handle JSX node types
// (JSXElement, JSXAttribute, JSXSpreadAttribute, JSXExpressionContainer); side-effect
// detection treats spread as SE and the polyfill should still inject for Array.from
function App({
  items
}) {
  const list = _Array$from(items);
  return <ul {...{
    id: 'list'
  }}>{_atMaybeArray(list).call(list, 0)}</ul>;
}
App({
  items: [1, 2, 3]
});