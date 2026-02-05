import 'core-js/stable';
import $btoa from 'core-js/stable/btoa';
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
