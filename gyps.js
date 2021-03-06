const Gyps = _ => {
  const gyps = Object.create(null);

  let last;

  /* Emit an event, calling all observers.
   * @param data Data object to be used on calling observers
   */
  gyps.emit = data => {
    last = data;
    return gyps;
  };

  /* Add a new observer. If an event was emitted before, the observer is called
   * with the last value.
   * @param observer Observer function to be added
   */
  gyps.observe = observer => {
    last ? observer(last) : null;
    const emit = gyps.emit;
    gyps.emit = data => {
      emit(data);
      observer(data);
      return gyps;
    };
    return gyps;
  };

  /* Map all values to a constant.
   * @param value Constant that will be emitted
   */
  gyps.constant = value => gyps.map(_ => value);

  /* Only emit values that pass the predicate.
   * @param predicate Test function, returns true if pass
   */
  gyps.filter = predicate => {
    const filter = Gyps();
    gyps.observe(data => predicate(data) && filter.emit(data));
    return filter;
  };

  /* Transform a observable of observables into a observable of values emitted
   * by values of the original observable.
   */
  gyps.flatten = _ => {
    const flatten = Gyps();
    gyps.observe(stream => stream.observe(data => flatten.emit(data)));
    return flatten;
  };

  /* Transform each value by a function.
   * @param mapper Function that will be applied to each value
   */
  gyps.map = mapper => {
    const map = Gyps();
    gyps.observe(data => map.emit(mapper(data)));
    return map;
  };

  /* Combine multiple observables into one.
   * @param streams Observables to be joined
   */
  gyps.merge = (...streams) => {
    const merge = Gyps();
    [gyps, ...streams]
      .forEach(stream => stream.observe(data => merge.emit(data)));
    return merge;
  };

  /* Accumulate values using a function.
   * @param reducer Function that receives the accumulated value and a new
   *   value, and return the new accumulated
   * @param initial Initial value
   */
  gyps.scan = (reducer, initial) => {
    const scan = Gyps();
    let value = initial;
    gyps.observe(data => scan.emit(value = reducer(value, data)));
    return scan;
  };

  /* Takes an observable of values, each time the original observable emits,
   * this observable emits the last value emitted by the observable of values.
   * @param value$ Observable of values to be emitted
   */
  gyps.trigger = value$ => {
    const trigger = Gyps();
    let value;
    value$.observe(x => value = x);
    gyps.observe(_ => trigger.emit(value));
    return trigger;
  };

  /* Wrap each value into an object with the key provided.
   * @param key Key used to wrap values
   */
  gyps.wrap = key => gyps.map(value => ({ [key]: value }));

  return gyps;
};
