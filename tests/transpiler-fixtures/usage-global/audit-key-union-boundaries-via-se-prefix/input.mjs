// Every reachable computed-key value contributes its method import. Dominating writes replace dead candidates; prototype and
// string-spelled symbol keys add no method.
const arr = [1, 2];
let seKey = 'entries';
if (c) seKey = 'keys';
let effects = 0;
export const viaSePrefix = arr[(effects++, seKey)];
