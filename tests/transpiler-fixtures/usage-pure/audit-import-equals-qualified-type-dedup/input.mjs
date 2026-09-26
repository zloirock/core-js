// An import-equals alias resolves a qualified receiver TYPE to a polyfillable built-in. `includes` is
// multi-type (Array and String), so the array-specific import path proves the receiver was resolved
// as Array through the alias. The same aliased member is used twice, so the injected pure import must
// be deduped to a single import, not one per use.
namespace N {
  export type Coll = number[];
}
import IM = N;
declare const first: IM.Coll;
declare const second: IM.Coll;
first.includes(1);
second.includes(2);
