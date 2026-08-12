import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `core-js-disable-next-line` covers the WHOLE multi-line statement it precedes, at any nesting depth.
// The scan behind that span used to stop at a fixed node budget - about sixteen levels of nested callbacks -
// and from there down the opt-out was silently revoked, injecting on a line the user had disabled. The
// second statement is the enabled control: it must keep its injection at the same depth.
import { cb, wrap, src } from 'lib';
cb(function () {
  cb(function () {
    cb(function () {
      cb(function () {
        cb(function () {
          cb(function () {
            cb(function () {
              cb(function () {
                cb(function () {
                  cb(function () {
                    cb(function () {
                      cb(function () {
                        cb(function () {
                          cb(function () {
                            cb(function () {
                              cb(function () {
                                cb(function () {
                                  cb(function () {
                                    cb(function () {
                                      cb(function () {
                                        // core-js-disable-next-line
                                        const disabled = wrap(Array.from(src));
                                        const enabled = wrap([...src].flat());
                                        return [disabled, enabled];
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});