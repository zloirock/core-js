// `import Def, { default as Alt }` declares two locals bound to the same module export.
// dedup must pick the bare default as target rather than the alias - first-write-wins
// on existingPureImports keeps the choice symmetric with #importInfoByName
import _Def, { default as _Alt } from '@core-js/pure/actual/promise/try';
Promise.try(() => 1);
console.log(_Def, _Alt);
