import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A member target rooted in a local object receives the extracted static.
const holder = {};
({
  from: holder.from
} = Array);
export { holder };