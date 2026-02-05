import 'core-js/es';
import $Uint8Array from 'core-js/es/typed-array/uint8-array';

$Uint8Array.fromBase64('SGVsbG8gd29ybGQ=', { alphabet: 'base64', lastChunkHandling: 'loose' });

function acceptUint8Array(v: Uint8Array) {}
function acceptProcessMetadata(v: { read: number; written: number }) {}
function acceptString(v: string) {}

acceptUint8Array(Uint8Array.fromBase64('SGVsbG8gd29ybGQ=', { alphabet: 'base64', lastChunkHandling: 'loose' }));
acceptUint8Array(Uint8Array.fromHex('ddddeeeassd'));
const ar = new Uint8Array(16);
acceptProcessMetadata(ar.setFromBase64('PGI+ TURO PC9i Pg==', { alphabet: 'base64', lastChunkHandling: 'loose' }));
acceptProcessMetadata(ar.setFromHex('ddddeeeassd'));
acceptString(ar.toBase64({ alphabet: 'base64', omitPadding: true }));
acceptString(ar.toBase64());
acceptString(ar.toHex());

// @ts-expect-error
Uint8Array.fromBase64('SGVsbG8gd29ybGQ', { alphabet: 'some' });
// @ts-expect-error
Uint8Array.fromBase64('SGVsbG8gd29ybGQ', { lastChunkHandling: 'some' });
// @ts-expect-error
Uint8Array.fromBase64(123);

// @ts-expect-error
Uint8Array.fromHex([0, 1]);
// @ts-expect-error
Uint8Array.fromHex(123);

// @ts-expect-error
ar.setFromBase64(5);
// @ts-expect-error
ar.setFromBase64('PGI+ TURO PC9i Pg==', { alphabet: 'some' });
// @ts-expect-error
ar.setFromBase64('PGI+ TURO PC9i Pg==', { lastChunkHandling: 'some' });

// @ts-expect-error
ar.setFromHex(123);

// @ts-expect-error
ar.toBase64({ alphabet: 'some' });
// @ts-expect-error
ar.toBase64({ omitPadding: 'some' });
