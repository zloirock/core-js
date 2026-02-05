import 'core-js/stable';
import $atob from 'core-js/stable/atob';
import { assertString } from '../../helpers';

assertString($atob('SGVsbG8gd29ybGQ='));

assertString(atob('SGVsbG8gd29ybGQ='));

// @ts-expect-error
$atob();
// @ts-expect-error
atob();
// @ts-expect-error
atob(123);
// @ts-expect-error
atob({});
