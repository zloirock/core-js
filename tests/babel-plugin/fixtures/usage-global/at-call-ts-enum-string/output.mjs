import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
enum Dir {
  Up = "UP",
  Down = "DOWN",
}
const d: Dir = Dir.Up;
d.at(-1);