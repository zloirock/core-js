import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
const el = <ul>{_mapMaybeArray(items).call(items, x => <li>{x}</li>)}</ul>;