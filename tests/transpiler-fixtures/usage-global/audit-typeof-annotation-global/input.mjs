// `typeof X` in an annotation position references the runtime binding `X`. in usage-global,
// the runtime reference must still trigger the constructor polyfill so the declaration is
// valid even if `X` is only named through the annotation (no bare runtime read elsewhere)
let mapType: typeof Map;
mapType = null;
