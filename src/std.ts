type ResultOk<T> = { ok: true, val: T };
type Ok<T> = ResultOk<T> & { unwrap: () => T };
type ResultErr<E> = { ok: false, err: E };
type Err<E> = ResultErr<E> & { unwrap: () => never };

export type Result<T, E> = (Ok<T> | Err<E>)

/**
  * Wraps a function that may throw so that it returns a Result in order to catch possible errors and treat them as values
  *
  * @example ```ts
  * const wrappedFetch = wrap<AbortError | NotAllowedError | TypeError>()(fetch)
  * ```
  */
export function wrap<E>() {
  return <T extends (...args: any[]) => any>(fn: T) =>
    (...args: Parameters<T>): Result<ReturnType<T>, E> => {
      try {
        const ok: ResultOk<ReturnType<T>> = {
          ok: true,
          val: fn(...args),
        };
        return {
          ok: ok.ok,
          val: ok.val,
          unwrap: () => ok.val,
        };
      } catch (err) {
        const e: ResultErr<E> = {
          ok: false,
          err: err as E,
        };
        return {
          ok: e.ok,
          err: e.err,
          unwrap: () => { throw new Error("Panicked unwrapping Result!"); }
        };
      }
    };
}


function unwrap<T>(res: ResultOk<T> | ResultErr<any>): () => T {

  return function() {
    if (!res.ok) throw new Error("Panicked unwrapping Result!");
    return res.val;
  }
}

/**
  * Wrap a value into the Ok type to return from a function that returns a Result type
  *
  * @param val The value to wrap into an Ok 
  */
export function Ok<T>(val: T): Ok<T> {
  const ok: ResultOk<T> = {
    ok: true,
    val,
  }

  return {
    ok: ok.ok,
    val: ok.val,
    unwrap: unwrap<T>(ok)
  }
}

/**
  * Wrap an error value into the Err type to return from a function that returns a Result type
  *
  * @param err The error value to wrap into an Err
  */
export function Err<E>(err: E): Err<E> {

  const e: ResultErr<E> = {
    ok: false,
    err,
  }

  return {
    ok: e.ok,
    err: e.err,
    unwrap: unwrap(e)
  }
}
