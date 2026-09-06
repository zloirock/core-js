// A bare side-effect import is the one spelling a core-js ENTRY takes, but only `entry-global`
// consumes one and only when the specifier is core-js. Here the method is a usage one and the
// specifier is the author's, so the import stands after the pass and the ESM markers keep the
// spelling. The author already mixed the two, and no injection spelling makes that file loadable -
// the tie goes to what the source says it is.
import "./a";
require("x");
[1].at(0);
