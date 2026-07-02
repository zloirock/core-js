import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
interface Props {
  items: string[];
}
function List({
  items
}: Props) {
  return <ul>{_mapMaybeArray(items).call(items, x => <li>{x}</li>)}</ul>;
}