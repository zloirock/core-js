// `stripQueryHash` strips Vite `?import` / webpack `?v=123` / `#hash` from source literals
// so a pre-existing bundler-suffixed import still matches the entry map and gets deduped
import _Array$from from "@core-js/pure/actual/array/from?v=abc";
_Array$from(x);
