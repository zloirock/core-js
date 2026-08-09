import 'core-js/full/number/clamp';
import 'core-js/full/string/cooked';

// These proposals don't exist natively — they MUST come from core-js
export const results = {
  clamp: 2.0.clamp(4, 6),
  cooked: String.cooked`hello`,
};
