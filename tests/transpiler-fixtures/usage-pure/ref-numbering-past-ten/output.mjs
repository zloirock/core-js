import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12;
// twelve optional-chain instance calls in a row force twelve temp refs. verifies that
// the allocated names cross the decimal boundary - `_ref10` / `_ref11` must not collide
// with the earlier `_ref` / `_ref1`-shape digits when the suffix generator counts up
null == (_ref = a().b) ? void 0 : _flatMaybeArray(_ref).call(_ref);
null == (_ref2 = c().d) ? void 0 : _flatMaybeArray(_ref2).call(_ref2);
null == (_ref3 = e().f) ? void 0 : _flatMaybeArray(_ref3).call(_ref3);
null == (_ref4 = g().h) ? void 0 : _flatMaybeArray(_ref4).call(_ref4);
null == (_ref5 = i().j) ? void 0 : _flatMaybeArray(_ref5).call(_ref5);
null == (_ref6 = k().l) ? void 0 : _flatMaybeArray(_ref6).call(_ref6);
null == (_ref7 = m().n) ? void 0 : _flatMaybeArray(_ref7).call(_ref7);
null == (_ref8 = o().p) ? void 0 : _flatMaybeArray(_ref8).call(_ref8);
null == (_ref9 = q().r) ? void 0 : _flatMaybeArray(_ref9).call(_ref9);
null == (_ref10 = s().t) ? void 0 : _flatMaybeArray(_ref10).call(_ref10);
null == (_ref11 = u().v) ? void 0 : _flatMaybeArray(_ref11).call(_ref11);
null == (_ref12 = w().x) ? void 0 : _flatMaybeArray(_ref12).call(_ref12);