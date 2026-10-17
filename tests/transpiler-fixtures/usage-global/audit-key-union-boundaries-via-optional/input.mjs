// Every reachable computed-key value contributes its method import. Dominating writes replace dead candidates; prototype and
// string-spelled symbol keys add no method.
const arr = [1, 2];
let optKey = 'find';
if (c) optKey = 'findIndex';
export const viaOptional = arr?.[optKey];
