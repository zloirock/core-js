import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
enum Status {
  Active,
  Inactive,
  Pending,
}
const s: Status = Status.Active;
s.toFixed(2);