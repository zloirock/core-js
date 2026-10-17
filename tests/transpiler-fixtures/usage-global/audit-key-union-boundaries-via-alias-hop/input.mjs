// Every reachable computed-key value contributes its method import. Dominating writes replace dead candidates; prototype and
// string-spelled symbol keys add no method.
const arr = [1, 2];
let hopSource = 'values';
if (c) hopSource = 'copyWithin';
const hopAlias = hopSource;
export const viaAliasHop = arr[hopAlias];
