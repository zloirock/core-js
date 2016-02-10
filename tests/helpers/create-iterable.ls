Function('return this')!createIterable = (elements, methods = {})->
  iterable =
    called:   no
    received: no
    (Symbol?iterator or core?Symbol?iterator): ->
      @received = on
      index     = 0
      return {
        next: ->
          iterable.called = on
          value: elements[index++], done: index > elements.length
      } <<< methods