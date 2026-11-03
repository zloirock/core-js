import _Map from "@core-js/pure/actual/map";
// A nested default owns its literal slot even outside an open parameter.
function read(source) {
  const {
    W: {
      C: {
        groupBy
      }
    } = {
      C: _Map
    }
  } = source;
  return groupBy;
}
use(read({}));