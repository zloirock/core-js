import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A guarded nested receiver is captured privately; only the source method is public.
declare const flag: boolean;
declare const user: any;
export namespace N {
  const {
    w: _ref
  } = {
    w: flag ? Object : user
  };
  export const entries = _ref === Object ? _Object$entries : _entries(_ref);
}