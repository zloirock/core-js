// imports from non-core-js sources (`my-lib/...`, `unrelated/...`) must NOT be treated
// as Symbol re-exports even when the source path mentions `symbol/iterator`. the `in`
// check stays plain string-key, not promoted to is-iterable
import _it from 'my-lib/symbol/iterator';
import { default as _other } from 'unrelated/symbol/asyncIterator';
const a = _it in [];
const b = _other in {};
export { a, b };
