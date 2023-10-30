import { $prototype, $virtual, $static, $namespace } from './templates.mjs';

export const features = {
  'array/at': {
    modules: { es: ['es.array.at'] },
    template: $prototype({ namespace: 'Array', method: 'at' }),
  },
  'array/virtual/at': {
    modules: { es: ['es.array.at'] },
    template: $virtual({ namespace: 'Array', method: 'at' }),
  },
  'array/from': {
    modules: { es: ['es.array.from'] },
    template: $static({ namespace: 'Array', method: 'from' }),
  },
  'array/index': {
    modules: { es: [/^es\.array\./], actual: ['esnext.array.from-async'], full: [/^esnext\.array\./] },
    template: $namespace({ namespace: 'Array' }),
  },
};
