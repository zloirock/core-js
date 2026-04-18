// `import 'lodash'` is a specifier-less import but not a core-js entry; entry-global's
// debug output must report "entry point not found", not "no polyfills added" - the latter
// would imply the entry WAS found and filtered by targets
import 'lodash';