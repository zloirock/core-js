import "core-js/modules/es.array.of";
// An unknown later key may replace the named slot with a different built-in.
// Its static method needs an import even when the named slot lacks that method.
const ns = {
  Q: Object,
  [key]: Array
};
const {
  Q: {
    of: method
  }
} = ns;
use(method);