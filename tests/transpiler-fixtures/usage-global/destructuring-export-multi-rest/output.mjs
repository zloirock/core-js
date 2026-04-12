import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
export const {
    from
  } = Array,
  {
    includes,
    ...rest
  } = obj;