import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// array-pattern with holes `[,, third]`: skip slots must not shift the binding index;
// `third` resolves to the third real element and gets the array-instance polyfill.
const [,, third] = ['a', 'b', 'c'];
_atMaybeString(third).call(third, 0);