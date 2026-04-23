// empty array targets used to fall through the validation whitelist and `if (targets)` in
// resolveTargets accepted it as truthy, silently drifting into browserslist defaults.
// symmetric with `targets: ''` which is already rejected
import "core-js";
