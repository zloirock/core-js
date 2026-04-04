import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
enum Mixed {
  Name = "hello",
  Value = 42,
}
const m: Mixed = Mixed.Name;
m.at(-1);