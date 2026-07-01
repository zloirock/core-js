// distributive conditional rename with template-pattern check: `as K extends `${string}_id` ? K : never`
// keeps members whose key matches the suffix and filters the rest. The template-pattern matcher
// evaluates the static prefix/suffix shape; the `never` branch translates to RENAME_SKIP
type FilterIds<T> = { [K in keyof T as K extends `${string}_id` ? K : never]: T[K] };
declare const r: FilterIds<{ user_id: number[]; name: string }>;
r.user_id.at(0);
