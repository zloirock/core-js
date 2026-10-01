import 'core-js/full';

declare const dv: DataView;

const rdv: number = dv.getUint8Clamped(0);
dv.setUint8Clamped(0, 255);

// @ts-expect-error
dv.getUint8Clamped();
// @ts-expect-error
dv.getUint8Clamped('0');
// @ts-expect-error
dv.getUint8Clamped(0, 2);
// @ts-expect-error
dv.setUint8Clamped(0);
// @ts-expect-error
dv.setUint8Clamped('0', 2);
// @ts-expect-error
dv.setUint8Clamped(0, '2');
// @ts-expect-error
dv.setUint8Clamped();
