// array-wrapped static extraction with a STRING-LITERAL consumed key: the `_unused`
// rename must keep the key's quotes so the residual pattern stays semantically intact
// and an inner `...rest` sibling still excludes the resolved property
const [{ 'from': f, ...r }, o] = [Array, {}];
f([1]);
r;
o;
