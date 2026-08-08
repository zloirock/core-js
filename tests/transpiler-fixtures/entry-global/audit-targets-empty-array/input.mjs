// empty array `targets: []` must be rejected at validation, not silently coerced into
// browserslist defaults. symmetric with `targets: ''` which is already rejected
import "core-js";
