// dynamic `import('core-js/...').then(...)` is a runtime call, not a static entry-import,
// and must not be substituted by the entry-global rewrite.
import('core-js/actual/array/from').then(() => {});