import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type API = {
  getUser(): {
    tags: string[];
  };
};
declare const api: API;
_atMaybeArray(_ref = api.getUser().tags).call(_ref, -1);