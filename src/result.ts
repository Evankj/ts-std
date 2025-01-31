
class UnwrapError extends Error { }

interface Unwrappable<T> {
  /**
   * @throws {UnwrapError} if this is called on a Result that contains an error
   */
  unwrap: () => T;
}


type Ok<T> = {
  ok: true;
  value: T;
  error: null; // OK
};

type Err<E> = {
  ok: false;
  value: null;
  error: E; // ERR
};

export type Result<T, E> = Unwrappable<T> & (Ok<T> | Err<E>);

export function Ok<T, E>(val: T): Result<T, E> {
  return {
    ok: true,
    value: val,
    error: null,
    // @ts-ignore - This functions as intended
    unwrap: () => {
      return val;
    },
  };
}

export function Err<T, E>(error: E): Result<T, E> {
  return {
    ok: false,
    value: null,
    error: error,
    unwrap: () => {
      throw new UnwrapError("Error unwrapping");
    },
  };
}

export function safeWrap<T extends (...args: any[]) => any>(
  fn: T,
): (...args: Parameters<T>) => Result<ReturnType<T>, unknown> {
  return (...args) => {
    try {
      return Ok(fn(...args));
    } catch (error) {
      return Err(error);
    }
  };
}

export type AsyncResult<T, E> = Promise<Result<T, E>>;

export function safeWrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): (
  ...args: Parameters<T>
) => AsyncResult<ReturnType<T>, unknown> {
  return async (...args) => {
    try {
      return Ok(await fn(...args));
    } catch (error) {
      return Err(error);
    }
  };
}




