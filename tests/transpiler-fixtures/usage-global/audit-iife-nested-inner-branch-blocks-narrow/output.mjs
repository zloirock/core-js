import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Nested synchronous IIFEs: lift recurses through each. inner straight-line check must
// apply at EACH lift step - not just the outermost. inner if at the innermost level still
// blocks the whole chain so x preserves its union.
function demo(cond) {
  let x = [];
  (() => {
    (() => {
      if (cond) x = "hello";
    })();
  })();
  x.at(-1);
}
demo(true);
demo(false);