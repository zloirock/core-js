// Flow `import typeof` erases at runtime, so it must NOT register as a pure-import dedup target -
// the later real `Array.from` must get its OWN pure import, not be rewritten onto the erased binding
import typeof ArrayFrom from '@core-js/pure/actual/array/from';
export const r = Array.from([1, 2]);
