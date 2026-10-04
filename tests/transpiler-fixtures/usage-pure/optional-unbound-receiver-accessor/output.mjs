import _at from "@core-js/pure/actual/instance/at";
// An unbound name can read a global accessor. Capture it before the optional null test.
export const value = rows == null ? void 0 : _at(rows)?.call(rows, 0);
export const method = rows == null ? void 0 : _at(rows);
export const sealed = (rows == null ? void 0 : _at(rows)).call(rows, 0);