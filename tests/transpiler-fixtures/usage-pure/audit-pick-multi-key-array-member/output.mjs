import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// Pick<T, K> with multi-key K narrowing - K is union of literal strings.
// The named-type resolver maps Pick to STRUCTURE_PRESERVING_WRAPPERS, returning
// the resolved inner T (full T regardless of K). Probe whether picked
// member access still narrows when K limits keys but the inner shape is
// still queried by member name. Documented precision limit per CLAUDE.md.
type Source = {
  items: number[];
  tags: string[];
  meta: {
    ok: boolean;
  };
};
type Picked = Pick<Source, 'items' | 'tags'>;
declare const v: Picked;
_atMaybeArray(_ref = v.items).call(_ref, 0);
_findLastMaybeArray(_ref2 = v.tags).call(_ref2, s => true);