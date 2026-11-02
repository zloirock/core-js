import Symbol from '@core-js/pure/es/symbol';
import getDescription from '@core-js/pure/es/symbol/description';

const value: string | undefined = getDescription(Symbol('value'));
const empty: string | undefined = getDescription(Symbol());

// @ts-expect-error descriptions are strings or undefined
const number: number = getDescription(Symbol('value'));
// @ts-expect-error the getter takes a symbol
getDescription('value');
