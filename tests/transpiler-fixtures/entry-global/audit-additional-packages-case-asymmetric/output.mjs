// `additionalPackages` value is lowercase (`@x/core-js`) while the input source is uppercase
// (`@X/core-js/...`). normalizeImportSource lowercases module ids before lookup, and the
// option-side packages are stored after the same lowercase pass, so the asymmetric mismatch
// resolves to the canonical lowercase form on both ends and the entry expands as expected
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";