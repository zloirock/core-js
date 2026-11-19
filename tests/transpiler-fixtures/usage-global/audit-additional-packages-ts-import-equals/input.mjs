// an `additionalPackages` fork source flows through the TS require-import recognition exactly
// like the main package - the packages list gates it (the same fork import without the option
// resolves nothing; only the core-js prefix passes the source check unconditionally)
import gf = require("@fork/core-js/actual/global-this");
export const viaForkTsEquals = gf.Map.groupBy([], (x: number) => x);
