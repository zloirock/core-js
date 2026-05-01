declare const tag: 'st' | 'nu';

function take(input: unknown) {
  if (typeof input === `${tag}ring`) {
    return input.at(0);
  }
  return null;
}
