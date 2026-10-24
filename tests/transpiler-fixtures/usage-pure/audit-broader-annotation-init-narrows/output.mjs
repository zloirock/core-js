import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// broad annotation (`object`) lets the concrete init narrow the type - opposite case to
// `T | null = null`: here init is informative and annotation deliberately permissive
const arr: object = [1, 2, 3];
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
const a = _flatMaybeArray(arr).call(arr);
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
const b = _atMaybeArray(arr).call(arr, 0);