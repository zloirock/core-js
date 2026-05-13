// Single-quasi TemplateLiteral computed key: `data[`foo`]` must narrow through the
// typed member just like `data['foo']` and `data.foo`. Distinct methods (.at vs .toFixed)
// per member make the per-key narrowing observable - a regression that drops the template
// fallback would emit array + string variants for `.at` (no Number.prototype.toFixed
// overlap) and miss the per-call narrowing both ways.
declare const data: { foo: string; bar: number };
data[`foo`].at(0);
data[`bar`].toFixed(2);
