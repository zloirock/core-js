import Symbol from '@core-js/pure/es/symbol';
import '@core-js/pure/es/symbol/description';
// @ts-expect-error the side-effect entry has no getter export
import description from '@core-js/pure/es/symbol/description';
import getDescription from '@core-js/pure/es/symbol/instance/description';
import getDescriptionJS = require('@core-js/pure/es/symbol/instance/description.js');
import getStableDescription from '@core-js/pure/stable/symbol/instance/description';
import getStableDescriptionJS = require('@core-js/pure/stable/symbol/instance/description.js');
import getActualDescription from '@core-js/pure/actual/symbol/instance/description';
import getActualDescriptionJS = require('@core-js/pure/actual/symbol/instance/description.js');
import getFullDescription from '@core-js/pure/full/symbol/instance/description';
import getFullDescriptionJS = require('@core-js/pure/full/symbol/instance/description.js');

declare const boxed: Symbol;

for (const get of [
  getDescription,
  getDescriptionJS,
  getStableDescription,
  getStableDescriptionJS,
  getActualDescription,
  getActualDescriptionJS,
  getFullDescription,
  getFullDescriptionJS,
]) {
  const value: string | undefined = get(Symbol('value'));
  const empty: string | undefined = get(Symbol());
  const boxedValue: string | undefined = get(boxed);
  const own: number = get({ description: 42 });
  const absent: undefined = get({ description: undefined });
  const literal: 'own' = get({ description: 'own' } as const);

  // @ts-expect-error descriptions are strings or undefined
  const number: number = get(Symbol('value'));
  // @ts-expect-error symbols can have no description
  const string: string = get(Symbol());
  // @ts-expect-error the getter requires a symbol or a description property
  get('value');
  // @ts-expect-error a numeric description is not a string
  const ownString: string = get({ description: 42 });
  // @ts-expect-error null has no properties
  get(null);
  // @ts-expect-error undefined has no properties
  get(undefined);
  // @ts-expect-error a receiver is required
  get();
}
