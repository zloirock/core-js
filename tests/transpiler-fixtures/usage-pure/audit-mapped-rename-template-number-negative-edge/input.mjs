// `${number}` placeholder accepts signed/decimal/exponent forms but rejects hex/BigInt literals.
// Matched keys narrow via the value type; rejected keys fall back to generic instance polyfills.
type Tag<T> = { [K in keyof T as K extends `v_${ number }` ? K : never]: T[K] };
declare const r: Tag<{ 'v_-1': number[]; 'v_3.14': string[]; 'v_0x10': boolean; 'v_42n': symbol }>;
r['v_-1'].at(0);
r['v_3.14'].includes('a');
r['v_0x10'].at(1);
r['v_42n'].includes(0);
