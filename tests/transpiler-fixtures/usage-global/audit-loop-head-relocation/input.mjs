// a LOOP HEAD binds per iteration and has no declaration a claim could extract into. usage-global
// adds side-effect imports and never restructures a head, so the relocation must NOT fire here -
// the head stays as the source wrote it, and what the rows pin is that the claims still derive
// their imports THROUGH the element's type. one method per line, and each is carried by SEVERAL
// types: a lost type would show as the other families' variants joining the set
const rows = [[1, 2], [3]];
for (const { includes } of rows) use(includes);
for (const { at } of ['ab']) use(at);
