import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
enum Priority {
  Low = -1,
  Normal = 0,
  High = 1,
}
const p: Priority = Priority.Normal;
p.toFixed(2);