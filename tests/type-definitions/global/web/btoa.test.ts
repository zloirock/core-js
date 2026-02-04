import 'core-js/full';
import $btoa from 'core-js/full/btoa';
import { assertString } from '../../helpers';

assertString($btoa('SGVsbG8gd29ybGQ='));

assertString(btoa('SGVsbG8gd29ybGQ='));

// @ts-expect-error
$btoa();
// @ts-expect-error
btoa();
// @ts-expect-error
btoa(123);
// @ts-expect-error
btoa({});
