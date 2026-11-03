import _Array$from from "@core-js/pure/actual/array/from";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
// A mirrored native getter reads after the preceding binding, once at each pattern slot.
// The other selection arm keeps its own value and property reads.
export function read(flag) {
  const previous = _Object$getOwnPropertyDescriptor(Array, 'includes');
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
      w: flag ? (Array, {
        from: _Array$from,
        get includes() {
          return Array.includes;
        }
      }) : {
        from: 17,
        includes: 23
      }
    };
    return [from, includes];
  } finally {
    if (previous) Object.defineProperty(Array, 'includes', previous);else delete Array.includes;
  }
}