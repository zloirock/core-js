// ImportExpression returns Promise. Member call on Promise's returned module shape
// must dispatch through Promise instance member resolution.
import('mod').then(mod => {
  mod.items.at(0);
});
