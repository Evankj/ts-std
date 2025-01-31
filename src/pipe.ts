import type { AsyncResult, Result } from "./result";

type SyncOrAsyncResult<T, E> = Result<T, E> | AsyncResult<T, E>;


// Original implementation for the Pipe interface and function sourced from here: https://dev.to/nexxeln/implementing-the-pipe-operator-in-typescript-30ip
interface Pipe {
  <A>(value: A): A;
  <A, B>(value: A, fn1: (input: A) => B): B;
  <A, B, C>(value: A, fn1: (input: A) => B, fn2: (input: B) => C): C;
  <A, B, C, D>(
    value: A,
    fn1: (input: A) => B,
    fn2: (input: B) => C,
    fn3: (input: C) => D
  ): D;
  <A, B, C, D, E>(
    value: A,
    fn1: (input: A) => B,
    fn2: (input: B) => C,
    fn3: (input: C) => D,
    fn4: (input: D) => E
  ): E;
  // Extend as needed
}

export const pipe: Pipe = (value: any, ...fns: Function[]): unknown => {
  return fns.reduce((acc, fn) => fn(acc), value);
};

export interface ResultPipe {
  <E>(): {
    <A extends any[], B>(fn1: (...inputs: A) => Result<B, E>): (...inputs: A) => Result<B, E>;
    <A extends any[], B, C>(
      fn1: (...inputs: A) => Result<B, E>,
      fn2: (input: B) => Result<C, E>
    ): (...inputs: A) => Result<C, E>;
    <A extends any[], B, C, D>(
      fn1: (...inputs: A) => Result<B, E>,
      fn2: (input: B) => Result<C, E>,
      fn3: (input: C) => Result<D, E>
    ): (...inputs: A) => Result<D, E>;
    <A extends any[], B, C, D, F>(
      fn1: (...inputs: A) => Result<B, E>,
      fn2: (input: B) => Result<C, E>,
      fn3: (input: C) => Result<D, E>,
      fn4: (input: D) => Result<F, E>
    ): (...inputs: A) => Result<F, E>;
  };
}

export const resultPipe: ResultPipe = <E>() => {
  return <A extends any[], B>(fn1: (...inputs: A) => Result<B, E>, ...fns: Array<(input: any) => Result<any, E>>) => (...inputs: A) => {
    return fns.reduce((acc, fn) => {
      if (!acc.ok) return acc; // Stop processing on the first error
      return fn(acc.value);
    }, fn1(...inputs));
  }
}

export interface AsyncResultPipe {
  <E>(): {
    <A extends any[], B>(fn1: (...inputs: A) => SyncOrAsyncResult<B, E>): (...inputs: A) => AsyncResult<B, E>;
    <A extends any[], B, C>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>
    ): (...inputs: A) => AsyncResult<C, E>;
    <A extends any[], B, C, D>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>
    ): (...inputs: A) => AsyncResult<D, E>;
    <A extends any[], B, C, D, F>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>,
      fn4: (input: Awaited<D>) => SyncOrAsyncResult<F, E>
    ): (...inputs: A) => AsyncResult<F, E>;
    <A extends any[], B, C, D, F, G>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>,
      fn4: (input: Awaited<D>) => SyncOrAsyncResult<F, E>,
      fn5: (input: Awaited<F>) => SyncOrAsyncResult<G, E>
    ): (...inputs: A) => AsyncResult<G, E>;
    <A extends any[], B, C, D, F, G, H>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>,
      fn4: (input: Awaited<D>) => SyncOrAsyncResult<F, E>,
      fn5: (input: Awaited<F>) => SyncOrAsyncResult<G, E>,
      fn6: (input: Awaited<G>) => SyncOrAsyncResult<H, E>
    ): (...inputs: A) => AsyncResult<H, E>;
    <A extends any[], B, C, D, F, G, H, I>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>,
      fn4: (input: Awaited<D>) => SyncOrAsyncResult<F, E>,
      fn5: (input: Awaited<F>) => SyncOrAsyncResult<G, E>,
      fn6: (input: Awaited<G>) => SyncOrAsyncResult<H, E>,
      fn7: (input: Awaited<H>) => SyncOrAsyncResult<I, E>
    ): (...inputs: A) => AsyncResult<I, E>;
    <A extends any[], B, C, D, F, G, H, I, J>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>,
      fn4: (input: Awaited<D>) => SyncOrAsyncResult<F, E>,
      fn5: (input: Awaited<F>) => SyncOrAsyncResult<G, E>,
      fn6: (input: Awaited<G>) => SyncOrAsyncResult<H, E>,
      fn7: (input: Awaited<H>) => SyncOrAsyncResult<I, E>,
      fn8: (input: Awaited<I>) => SyncOrAsyncResult<J, E>
    ): (...inputs: A) => AsyncResult<J, E>;
    <A extends any[], B, C, D, F, G, H, I, J, K>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>,
      fn4: (input: Awaited<D>) => SyncOrAsyncResult<F, E>,
      fn5: (input: Awaited<F>) => SyncOrAsyncResult<G, E>,
      fn6: (input: Awaited<G>) => SyncOrAsyncResult<H, E>,
      fn7: (input: Awaited<H>) => SyncOrAsyncResult<I, E>,
      fn8: (input: Awaited<I>) => SyncOrAsyncResult<J, E>,
      fn9: (input: Awaited<J>) => SyncOrAsyncResult<K, E>
    ): (...inputs: A) => AsyncResult<K, E>;
    <A extends any[], B, C, D, F, G, H, I, J, K, L>(
      fn1: (...inputs: A) => SyncOrAsyncResult<B, E>,
      fn2: (input: Awaited<B>) => SyncOrAsyncResult<C, E>,
      fn3: (input: Awaited<C>) => SyncOrAsyncResult<D, E>,
      fn4: (input: Awaited<D>) => SyncOrAsyncResult<F, E>,
      fn5: (input: Awaited<F>) => SyncOrAsyncResult<G, E>,
      fn6: (input: Awaited<G>) => SyncOrAsyncResult<H, E>,
      fn7: (input: Awaited<H>) => SyncOrAsyncResult<I, E>,
      fn8: (input: Awaited<I>) => SyncOrAsyncResult<J, E>,
      fn9: (input: Awaited<J>) => SyncOrAsyncResult<K, E>,
      fn10: (input: Awaited<K>) => SyncOrAsyncResult<L, E>
    ): (...inputs: A) => AsyncResult<L, E>;
  };
}

export const asyncResultPipe: AsyncResultPipe = <E>() => {
  return <A extends any[], B>(fn1: (...inputs: A) => SyncOrAsyncResult<B, E>, ...fns: Array<(input: any) => SyncOrAsyncResult<any, E>>) => async (...inputs: A) => {

    let result = await fn1(...inputs);
    for (const fn of fns) {
      if (!result.ok) return result; // Stop processing on the first error
      result = await fn(result.value);
    }
    return result;
  };
}
