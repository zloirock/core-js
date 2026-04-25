// trailing slash in `additionalPackages` value (`'my-core-js/'`) resolves like the canonical
// form (`'my-core-js'`). plugin strips trailing slashes when normalizing pkg names so entry
// detection works regardless of the user's misconfiguration
import 'my-core-js/actual/array/at';
