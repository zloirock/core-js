const realm = typeof Symbol == 'function' ? Symbol : {};
export const memberIn = receiver => realm.iterator in receiver;
