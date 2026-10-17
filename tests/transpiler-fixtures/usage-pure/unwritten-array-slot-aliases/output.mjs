import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// An unwritten array alias preserves the family of each literal element.
// Distinct methods expose Array and String inference without sharing injected modules.
const arrays = [[1, 2]];
const arrayAlias = arrays;
use(_atMaybeArray(arrayAlias[0]));
const strings = ['12'];
const stringAlias = strings;
use(_includesMaybeString(stringAlias[0]));