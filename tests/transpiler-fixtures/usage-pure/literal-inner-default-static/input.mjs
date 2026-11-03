// A nested default owns its literal slot even outside an open parameter.
function read(source) {
  const { W: { C: { groupBy } } = { C: globalThis.Map } } = source;
  return groupBy;
}
use(read({}));
