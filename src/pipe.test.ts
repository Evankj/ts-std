import { expect, test, describe } from "bun:test";
import { asyncResultPipe } from "./pipe";
import { Ok, Err, type Result } from "./result";

describe("asyncResultPipe", () => {
  const addOne = (n: number): Result<number, string> => Ok(n + 1);
  const multiplyByTwo = (n: number): Result<number, string> => Ok(n * 2);
  const toString = (n: number): Result<string, string> => Ok(n.toString());
  const asyncAddOne = async (n: number): Promise<Result<number, string>> => Ok(n + 1);
  const asyncMultiplyByTwo = async (n: number): Promise<Result<number, string>> => Ok(n * 2);
  const failAtFive = (n: number): Result<number, string> => 
    n === 5 ? Err("Failed at 5") : Ok(n);
  
  test("should work with a single function", async () => {
    const pipe = asyncResultPipe<string>()(
      async (n: number) => Ok(n + 1)
    );
    const result = await pipe(1);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });

  test("should work with two functions", async () => {
    const pipe = asyncResultPipe<string>()(
      addOne,
      multiplyByTwo
    );
    const result = await pipe(1);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(4); // (1 + 1) * 2
  });

  test("should work with three functions", async () => {
    const pipe = asyncResultPipe<string>()(
      addOne,
      multiplyByTwo,
      toString
    );
    const result = await pipe(1);
    expect(result.ok).toBe(true);
    expect(result.value).toBe("4"); // ((1 + 1) * 2).toString()
  });

  test("should work with mixed sync/async functions", async () => {
    const pipe = asyncResultPipe<string>()(
      asyncAddOne,
      multiplyByTwo,
      asyncMultiplyByTwo,
      toString
    );
    const result = await pipe(1);
    expect(result.ok).toBe(true);
    expect(result.value).toBe("8"); // (((1 + 1) * 2) * 2).toString()
  });

  test("should stop processing on first error", async () => {
    const pipe = asyncResultPipe<string>()(
      addOne,
      failAtFive,
      multiplyByTwo
    );
    const result = await pipe(4); // 4 + 1 = 5, should fail
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Failed at 5");
  });

  test("should work with ten functions", async () => {
    const pipe = asyncResultPipe<string>()(
      addOne,           // 2
      multiplyByTwo,    // 4
      asyncAddOne,      // 5
      asyncMultiplyByTwo,// 10
      addOne,           // 11
      multiplyByTwo,    // 22
      asyncAddOne,      // 23
      asyncMultiplyByTwo,// 46
      addOne,           // 47
      toString          // "47"
    );
    const result = await pipe(1);
    expect(result.ok).toBe(true);
    expect(result.value).toBe("47");
  });

  test("should handle multiple input parameters in first function", async () => {
    const pipe = asyncResultPipe<string>()(
      async (a: number, b: number) => Ok(a + b),
      multiplyByTwo,
      toString
    );
    const result = await pipe(2, 3);
    expect(result.ok).toBe(true);
    expect(result.value).toBe("10"); // ((2 + 3) * 2).toString()
  });

  test("should return early and not execute subsequent functions on error", async () => {
    let spyFunctionCalled = false;
    const spyFunction = (n: number): Result<number, string> => {
      spyFunctionCalled = true;
      return Ok(n);
    };

    const pipe = asyncResultPipe<string>()(
      addOne,           // 2
      failAtFive,       // Error at 5
      spyFunction,      // Should never be called
      multiplyByTwo     // Should never be called
    );

    const result = await pipe(4); // 4 + 1 = 5, triggers error
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Failed at 5");
    expect(spyFunctionCalled).toBe(false);
  });

  test("should maintain error type through the pipeline", async () => {
    type CustomError = { code: number; message: string };
    const customErr = (msg: string): Result<number, CustomError> => 
      Err({ code: 400, message: msg });

    const pipe = asyncResultPipe<CustomError>()(
      async (n: number) => Ok(n + 1),
      () => customErr("Custom error"),
      (n) => Ok(n * 2)
    );
    
    const result = await pipe(1);
    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ code: 400, message: "Custom error" });
  });
});
