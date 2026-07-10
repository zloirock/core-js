import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// an anonymous object handed as a JSX ATTRIBUTE value is the moral call argument of
// `createElement(Foo, { data: anon })`: the component holds a live reference and may
// mutate the fields, so `this.<field>` methods widen (module-local judgement kept the
// Array narrow though an outside holder can flip it, ie:11)
export const viaJsxAttr = <Widget data={{
  items: [1, 2],
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}} />;

// a local anon with no escape keeps its narrow
const local = {
  items: [3, 4],
  read() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.items).call(_ref2, 3);
  }
};
export const viaLocal = local.read();