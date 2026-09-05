// two consecutive entries WITHOUT trailing semicolons, then a bracket-leading follower. removing
// both must NOT inject a spurious leading `;` before the array: the ASI boundary scan accounts for
// the whole removal batch, so a leftward to-be-removed entry is not read as the surviving prev
import "core-js/actual/array/flat"
import "core-js/actual/array/at"
[1, 2].forEach(x => x);
