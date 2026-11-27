// Decimal and hexadecimal strings match a numeric template. A BigInt suffix does not.
type Tag<T> = { [K in keyof T as K extends `v_${ number }` ? K : never]: T[K] };
declare const r: Tag<{ 'v_-1': number[]; 'v_3.14': string[]; 'v_0x10': boolean; 'v_42n': symbol }>;
r['v_-1'].at(0);
r['v_3.14'].includes('a');
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r['v_0x10'].at(1);
r['v_42n'].includes(0);
