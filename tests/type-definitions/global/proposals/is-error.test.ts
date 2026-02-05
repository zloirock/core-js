import 'core-js/es';
import isError from 'core-js/es/error/is-error';
import { assertBool } from '../../helpers';

const e = new Error();
const ne = { foo: 1 };

assertBool(isError(e));
// @ts-expect-error
isError();

assertBool(Error.isError(e));
Error.isError(ne);
Error.isError(undefined);
Error.isError('str');

// @ts-expect-error
Error.isError();
