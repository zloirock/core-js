// user already imports `es.array.from`; plugin still injects `Array.from`-related
// dependencies (object.to-string, string.iterator) but does NOT duplicate the existing
// import. dedup keys on the resolved module path
import 'core-js/modules/es.array.from';
Array.from(arr);
