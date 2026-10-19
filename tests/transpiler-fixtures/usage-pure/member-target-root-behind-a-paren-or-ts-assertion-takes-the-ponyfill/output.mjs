import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// A paren or a TS assertion around the root of a member target, or around an object on its chain, spells the
// same slot: the target takes the ponyfill like its bare twin, a computed sole chain included.
let sink = {},
  deep = {
    a: {}
  },
  alt: any = {};
// @ts-expect-error dynamic JS adds a member the declared type lacks
sink.f = _Array$from;
// @ts-expect-error dynamic JS adds a member the declared type lacks
deep.a.f = _Array$of;
(alt as any).g = _Array$fromAsync;
alt![k()] = _Set;
(alt satisfies object).m = _Map;