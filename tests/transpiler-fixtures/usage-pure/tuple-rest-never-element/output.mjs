import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type Selected = [any] extends [...never[]] ? number[] : string;
export function last(value: Selected) {
  return _atMaybeString(value).call(value, -1);
}