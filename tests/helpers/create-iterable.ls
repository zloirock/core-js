Function('return this')!createIterable = (elements, methods = {})->
  index    = 0
  iterator = {
    next: ->
      iterable.called = on
      value: elements[index++], done: index > elements.length
  } <<< methods
  iterable =
    called:   no
    received: no
    (Symbol?iterator or core?Symbol?iterator): ->
      @received = on
      iterator