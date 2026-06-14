// a numeric destructuring key with a defaulted binding: the init literal supplies key `0`, so the
// default is dead and the binding holds the string value. the member-presence probe must compare the
// numeric init key against the (stringified) pattern key path - a raw numeric/string mismatch judged
// the member absent, fired the array default, and narrowed the string to the array `at` helper.
const { 0: picked = [] } = { 0: 'hello' };
picked.at(0);
