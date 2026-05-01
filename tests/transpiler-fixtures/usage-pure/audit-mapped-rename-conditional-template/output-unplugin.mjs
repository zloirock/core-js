import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// distributive conditional rename with template-pattern check: `as K extends `${string}_id` ? K : never`
// keeps members whose key matches the suffix and filters the rest. matchTemplatePattern
// evaluates the static prefix/suffix shape; the `never` branch translates to RENAME_SKIP
type FilterIds<T> = { [K in keyof T as K extends `${string}_id` ? K : never]: T[K] };
declare const r: FilterIds<{ user_id: number[]; name: string }>;
_atMaybeArray(_ref = r.user_id).call(_ref, 0);