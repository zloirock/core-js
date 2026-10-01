// An identity IIFE preserves its call shape while supplying a mirrored static receiver.
const { Array: { from } } = (g => g)(globalThis);
from([1]);
