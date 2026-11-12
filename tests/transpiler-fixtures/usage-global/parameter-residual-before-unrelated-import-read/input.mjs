// A body read does not own the receiver of a parameter default.
import realm from "@core-js/pure/actual/global-this";
import groupBy from "@core-js/pure/actual/map/group-by";
let custom, method;
export function read(value = ({ custom } = realm.Map)) {
  method = groupBy;
  return value;
}
