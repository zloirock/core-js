import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare const data: { user: { items: number[] } };
const { user: { items: list } } = data;
_atMaybeArray(list).call(list, -1);