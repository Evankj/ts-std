import { safeWrap } from "../src/result"
import { expect, test } from 'bun:test'

test("Function that throws should have exception caught when wrapped", () => {
  const errorMessage = "I should have been caught!";

  function functionThatThrows(): void {
    throw new Error(errorMessage);
  }

  const wrappedFunctionThatThrows = safeWrap(functionThatThrows);

  const result = wrappedFunctionThatThrows();

  expect(result.ok).toBe(false);
});

test("Unwrapping an Err result should throw", () => {
  const errorMessage = "I should have been caught!";
  function functionThatThrows(): void {
    throw new Error(errorMessage);
  }

  const wrappedFunctionThatThrows = safeWrap(functionThatThrows);

  const result = wrappedFunctionThatThrows();

  expect(result.unwrap).toThrow();
});

test("Unwrapping an Ok result should be fine", () => {
  function functionThatNeverThrows(): number {
    return 1;
  }

  const wrappedFunctionThatNeverThrows = safeWrap(functionThatNeverThrows);

  const result = wrappedFunctionThatNeverThrows();

  expect(result.unwrap()).toBe(1);
});
