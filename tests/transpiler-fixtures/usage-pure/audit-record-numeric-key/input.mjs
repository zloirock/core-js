// Record<number, V> — synthetic TSIndexSignature emitted at line 1080-1083 doesn't carry parameters
// describing the key type. pickIndexSignature reads `member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type`
// — for a synthetic Record<number, V> sig, parameters is missing, so keyType is undefined,
// triggering the stringSig fallback (line 1209). Should still resolve V correctly though.
type NumericRecord = Record<number, string[]>;
declare const r: NumericRecord;
r[5].at(0);
