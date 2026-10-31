import $isError from '@core-js/pure/full/error/is-error';

const e = new Error();
const ne = { foo: 1 };

const re1: boolean = $isError(e);
$isError(ne);
$isError(undefined);
$isError('str');

declare const smth: unknown;
if ($isError(smth)) {
  const message: string = smth.message;
}

// @ts-expect-error
$isError();
