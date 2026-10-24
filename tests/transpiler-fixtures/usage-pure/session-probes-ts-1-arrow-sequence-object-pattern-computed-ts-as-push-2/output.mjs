import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const k = 'k';
const arr = [1, 2];
const log = [];
{
  // @ts-expect-error a computed key tsc refuses is the shape under test
  const k = (tag: string) => (_pushMaybeArray(log).call(log, tag), tag);
  const a = (k('at' as string), _atMaybeArray(arr));
}