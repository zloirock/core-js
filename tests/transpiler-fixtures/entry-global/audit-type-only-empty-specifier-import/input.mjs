// `import type {} from 'core-js/...'` erases before runtime, so it is NOT a side-effect entry and
// must not expand into runtime modules; the value-mode `import 'core-js/...'` below still does
import type {} from "core-js/actual/array/from";
import "core-js/actual/array/of";
