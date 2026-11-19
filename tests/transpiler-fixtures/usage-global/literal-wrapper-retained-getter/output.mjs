import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A mirrored native getter reads after the preceding binding, once at each pattern slot.
// The other selection arm keeps its own value and property reads.
export function read(flag) {
  const previous = Object.getOwnPropertyDescriptor(Array, 'includes');
  try {
    Object.defineProperty(Array, 'includes', {
      configurable: true,
      get() {
        return from;
      }
    });
    const {
      w: {
        from,
        includes
      }
    } = {
      w: flag ? Array : {
        from: 17,
        includes: 23
      }
    };
    return [from, includes];
  } finally {
    if (previous) Object.defineProperty(Array, 'includes', previous);else delete Array.includes;
  }
}