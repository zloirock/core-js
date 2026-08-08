// empty `BROWSERSLIST_ENV` env-var paired with an explicit `targets:{ie:11}` option:
// the option short-circuits browserslist consultation (targetsParser sees explicit
// targets first), so BROWSERSLIST_ENV's value is irrelevant here. fixture documents
// that explicit-targets path is unaffected by env-var presence.
import 'core-js/actual/array/at';
