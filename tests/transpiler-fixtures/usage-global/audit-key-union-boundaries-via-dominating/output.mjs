import "core-js/modules/es.array.with";
// Every reachable computed-key value contributes its method import. Dominating writes replace dead candidates; prototype and
// string-spelled symbol keys add no method.
const arr = [1, 2];
let dominated = 'flatMap';
dominated = 'with';
export const viaDominating = arr[dominated];