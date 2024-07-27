# What is this?
This is a tiny library I made for myself to make working with functions that can throw in TypeScript a little easier to work with. It is heavily inspired by Rust's [Result](https://doc.rust-lang.org/std/result/) monadic type and the [Effect](https://effect.website/) library.

## `wrap`
The `wrap` function wraps the provided function so that it returns a `Result` whose `Err` value captures anything that is thrown by the function. You can supply a type parameter to the `wrap` function to add some type hinting in your editor, but due to the nature of exception throwing in JavaScript, the type of the exception that is thrown cannot be know at "compile time" (if it could, this library and others like it wouldn't need to exist!), so you will need to make sure to keep the type parameter in sync with the types that are thrown by the wrapped function yourself if you want to use them.

## `Result`
This is a type that mirrors Rust's Result type.

The `Ok` and `Err` functions have been added to make it easy to write your own functions that return `Result` types that can be "unwrapped".

## Usage Examples

Wrapping an API you don't "own":
```typescript
const saferFetch = wrap<Error | TypeError>()(fetch);

function pingMyAPI() {

  const result = saferFetch("http://my.api.com/ping", {
    headers: {
      "mal form ed hea der": ""
    }
  });

  if (!result.ok) {
    const error = result.err;
    if (error instanceof TypeError) {
      console.error("We probably have a malformed header entry!", error);
    }
  }
}
```

A function that returns a `Result`:
```typescript
function nameIsBob(name: string): Result<true, string> {
  if (name === "Bob") {
    return Ok(true);
  }
  return Err("Name is not Bob!");
}
```

Unwrapping a `Result` that is an `Err`:
```typescript
function thisWillThrow(): void {
  throw new Error("I threw");
}

const notSafeToUnwrap = wrap()(thisWillThrow);

notSafeToUnwrap().unwrap(); // Unhandled Exception: I threw!
```
