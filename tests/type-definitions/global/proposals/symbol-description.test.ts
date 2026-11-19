import 'core-js/full';
import 'core-js/es/symbol/description';
// @ts-expect-error the side-effect entry has no getter export
import description from 'core-js/es/symbol/description';
import getDescription from 'core-js/es/symbol/instance/description';
import getDescriptionJS = require('core-js/es/symbol/instance/description.js');
import getStableDescription from 'core-js/stable/symbol/instance/description';
import getStableDescriptionJS = require('core-js/stable/symbol/instance/description.js');
import getActualDescription from 'core-js/actual/symbol/instance/description';
import getActualDescriptionJS = require('core-js/actual/symbol/instance/description.js');
import getFullDescription from 'core-js/full/symbol/instance/description';
import getFullDescriptionJS = require('core-js/full/symbol/instance/description.js');

const sym1 = Symbol('foo');
const d1: string | undefined = sym1.description;

const sym2 = Symbol();
const d2: string | undefined = sym2.description;

// @ts-expect-error
sym1['description'] = 'bar';

// @ts-expect-error
const n: number = sym1.description;

// @ts-expect-error
sym2.description();

// @ts-expect-error
sym1.description = 123;

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
  const value: string | undefined = get(sym1);
  const empty: string | undefined = get(sym2);
  const boxedValue: string | undefined = get(boxed);
  const own: number = get({ description: 42 });
  const absent: undefined = get({ description: undefined });
  const literal: 'own' = get({ description: 'own' } as const);

  // @ts-expect-error descriptions are strings or undefined
  const number: number = get(sym1);
  // @ts-expect-error symbols can have no description
  const string: string = get(sym2);
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
