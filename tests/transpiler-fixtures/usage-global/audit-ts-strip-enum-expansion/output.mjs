import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
var Status = /*#__PURE__*/function (Status) {
  Status[Status["Open"] = 0] = "Open";
  Status[Status["Closed"] = 1] = "Closed";
  return Status;
}(Status || {});
const items = [Status.Open, Status.Closed];
items.at(-1);
Array.from(items);