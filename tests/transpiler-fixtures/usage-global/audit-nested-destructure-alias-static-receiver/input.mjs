// `Arr` is bound through a nested destructure pattern (source key path box -> Array), then
// re-aliased through another object whose static member `from` is destructured. the
// static-receiver walk must descend the full key path of the nested binding to recognize the
// receiver as the global Array, otherwise `Array.from` is left unpolyfilled
const { box: { Array: Arr } } = { box: globalThis };
const { a: { from } } = { a: Arr };
from([1, 2, 3]);
