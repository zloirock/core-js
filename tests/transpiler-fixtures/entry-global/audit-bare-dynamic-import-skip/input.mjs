// bare dynamic `import('core-js/...')` is a runtime call, not a static entry-import,
// and must not be substituted by the entry-global rewrite.
import('core-js/actual/array/from');
