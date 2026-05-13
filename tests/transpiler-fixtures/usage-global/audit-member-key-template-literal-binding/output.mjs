import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
// Const-bound single-quasi TemplateLiteral as computed key: `const k = `foo`; data[k]`
// resolves through resolveRuntimeExpression's binding-follow, then singleQuasiString must
// pick up the TemplateLiteral init. Distinct methods (.at vs .toFixed) per resolved key
// catch any regression where the alias-follow drops the template fallback.
declare const data: {
  foo: string;
  bar: number;
};
const sKey = `foo`;
const nKey = `bar`;
data[sKey].at(0);
data[nKey].toFixed(2);