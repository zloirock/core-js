import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a syntactically-present destructuring member whose VALUE may be nullish keeps its
// default live: at runtime the nullish path fires the default, so the binding may hold
// either family - member-type-alone narrowing to a string Maybe throws on the array
// default (ie:11); the fold must stay generic
declare const maybe: string | undefined;
const {
  a = [1, 2, 3]
} = {
  a: maybe
};
export const viaNullishMember = _at(a).call(a, 0);

// a literally-present member keeps the default dead - its precise type still narrows
const {
  b = [4, 5]
} = {
  b: 'hello'
};
export const viaPresentMember = _includesMaybeString(b).call(b, 'h');