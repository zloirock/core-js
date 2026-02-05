import 'core-js/es';
import $ArrayBuffer from 'core-js/es/array-buffer';

const abFromNamespace = new $ArrayBuffer(16);
const abFNSTransfer: ArrayBuffer = abFromNamespace.transfer();

const ab = new ArrayBuffer(16);
// TODO uncomment when fixed
// const abDetached: boolean = ab.detached;
const abTransfer: ArrayBuffer = ab.transfer();
const abTransfer2: ArrayBuffer = ab.transfer(32);
const abTransferFixed: ArrayBuffer = ab.transferToFixedLength();
const abTransferFixed2: ArrayBuffer = ab.transferToFixedLength(64);

// @ts-expect-error
ab.detached(1);
// @ts-expect-error
ab.detached = true;
// @ts-expect-error
ab.transfer('32');
// @ts-expect-error
ab.transfer(true);
// @ts-expect-error
ab.transfer(16, 32);
// @ts-expect-error
ab.transferToFixedLength('100');
// @ts-expect-error
ab.transferToFixedLength(false);
// @ts-expect-error
ab.transferToFixedLength(32, 64);
