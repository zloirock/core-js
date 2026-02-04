import 'core-js/full';
import cooked from 'core-js/full/string/cooked';
import $String from 'core-js/full/string';
import { assertString } from '../../helpers';

assertString(cooked([]));
$String.cooked([]);

assertString(String.cooked(['foo', 'bar'], 1, 2));
String.cooked([]);

// @ts-expect-error
$String.cooked(1);
// @ts-expect-error
cooked(1);

// @ts-expect-error
String.cooked(1);
// @ts-expect-error
String.cooked(false);
