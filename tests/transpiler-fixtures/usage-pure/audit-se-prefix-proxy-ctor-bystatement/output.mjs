import _Map from "@core-js/pure/actual/map";
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
function effect() {
  return 0;
}
const {
  groupBy,
  ...mapRest
} = (effect(), _Map);
groupBy([], item => item);