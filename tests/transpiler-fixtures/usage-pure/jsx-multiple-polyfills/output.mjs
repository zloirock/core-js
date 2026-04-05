import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
const el = <div title={_trimMaybeString(str).call(str)} data-items={_flatMaybeArray(arr).call(arr)} data-last={_at(arr).call(arr, -1)} />;