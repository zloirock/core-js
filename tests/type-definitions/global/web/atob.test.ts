import 'core-js/full';
import $atob from 'core-js/full/atob';
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
