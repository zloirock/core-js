import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A tagged inherited static keeps its native receiver; pure does not detach it.
class Bag extends Array {}
export const result = Bag.from`x` instanceof Bag;