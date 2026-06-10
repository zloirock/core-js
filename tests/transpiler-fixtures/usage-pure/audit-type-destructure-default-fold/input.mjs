// a defaulted destructure binding types as the FOLD of the member and the default: a foreign
// pair keeps the generic dispatch (a one-sided narrow dropped the other flavor's entry), an
// unknown receiver keeps generic, and a statically ABSENT member takes the default's type alone
declare const data: { items?: string };
const { items = [] } = data;
items.at(-1);
const { rows = [] } = JSON.parse(src);
rows.at(-1);
const [tag = ''] = [];
tag.at(0);
