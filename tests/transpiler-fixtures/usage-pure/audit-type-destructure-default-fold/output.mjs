import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a defaulted destructure binding types as the FOLD of the member and the default: a foreign
// pair keeps the generic dispatch (a one-sided narrow dropped the other flavor's entry), an
// unknown receiver keeps generic, and a statically ABSENT member takes the default's type alone
declare const data: {
  items?: string;
};
const {
  items = []
} = data;
_at(items).call(items, -1);
const {
  rows = []
} = JSON.parse(src);
_at(rows).call(rows, -1);
const [tag = ''] = [];
_atMaybeString(tag).call(tag, 0);