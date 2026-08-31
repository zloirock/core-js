import createMatcher from '../domain/matcher.js';

export default function createChooseBundle(plan, { resolve }) {
  const match = createMatcher(plan);

  return function chooseBundle(headers) {
    return match(resolve(headers));
  };
}
