// A local capture keeps its namespace and the adjacent intrinsic read.
export function read() {
  let name, groupBy;
  const value = ({ name, groupBy } = globalThis.zz || Map);
  return [name, typeof groupBy, value === Map];
}
