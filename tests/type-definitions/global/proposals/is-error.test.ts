import 'core-js/full';

const e = new Error();
const ne = { foo: 1 };

const re1: boolean = Error.isError(e);
Error.isError(ne);
Error.isError(undefined);
Error.isError('str');

// @ts-expect-error
Error.isError();
