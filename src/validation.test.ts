import { expect, test, describe } from "bun:test";
import { array, number, optional, string, union, validateSchema } from "./validation";

describe("Validation", () => {
  test("It should validate a valid object", () => {

    const TestSchema = {
      a: string,
      b: number,
      c: {
        test: string,
        bob: number,
      },
    };

    const valueToTest = {
      a: 'hello',
      b: 42,
      c: {
        test: 'world',
        bob: 123,
      },
    };

    const isValid = validateSchema(TestSchema, valueToTest);

    expect(isValid.ok).toBe(true);
    expect(isValid.unwrap()).toEqual(valueToTest);

  });

  test("It should fail validation for invalid value", () => {
    const TestSchema = {
      a: string,
      b: number,
      c: {
        test: string,
        bob: number,
      },
    };

    const valueToTest = {
      a: 0,
      b: "test",
      c: {
        test: 123,
        bob: "test",
      },
    };

    const validationResult = validateSchema(TestSchema, valueToTest);
    expect(validationResult.ok).toBe(false);
    expect(validationResult.error?.errors.length).toBe(4);
  });

  test("It should support optional values in schema", () => {
    const TestSchema = {
      a: optional(string),
      b: number,
      c: {
        test: string,
        bob: optional(number),
      },
    };

    const testValueNoOptionals = {
      b: 0,
      c: {
        test: "test",
      },
    };

    const testValueWithOptionals = {
      a: "test",
      b: 0,
      c: {
        test: "test",
        bob: 5
      },
    };

    const validationResultWithoutOptionals = validateSchema(TestSchema, testValueNoOptionals);
    expect(validationResultWithoutOptionals.ok).toBe(true);

    const validationResultWithOptionals = validateSchema(TestSchema, testValueWithOptionals);
    expect(validationResultWithOptionals.ok).toBe(true);
  });


  test("It should work with type aliases", () => {
    const TestSchema = number;
    const validationResult = validateSchema(TestSchema, 5);
    expect(validationResult.ok).toBe(true)
    const incorrectResult = validateSchema(TestSchema, "test");
    expect(incorrectResult.ok).toBe(false)
  });


  test("It should support arrays in the schema", () => {
    const TestSchema = {
      a: array(string)
    };

    const validValues = {
      a: ["a", "b", "c"]
    }

    const invalidValues = {
      a: ["a", "b", 5]
    }

    expect(validateSchema(TestSchema, validValues).ok).toBe(true)
    expect(validateSchema(TestSchema, invalidValues).ok).toBe(false)
  })

  test("It should support unions in the schema", () => {
    const TestSchema = union(number, string)
    const validValue1 = 1
    const validValue2 = "test"

    const invalidValue = [
      1
    ]


    expect(validateSchema(TestSchema, validValue1).ok).toBe(true)
    expect(validateSchema(TestSchema, validValue2).ok).toBe(true)
    expect(validateSchema(TestSchema, invalidValue).ok).toBe(false)
  })

  test("It should support arrays of unions and unions of arrays in the schema", () => {

    const TestSchema1 = array(union(string, number))
    const TestSchema2 = union(array(number), string)

    const validValue1 = [
      "test",
      5,
    ];

    const validValue2 = [1, 2, 3]

    const validValue3 = "test"

    expect(validateSchema(TestSchema1, validValue1).ok).toBe(true)
    expect(validateSchema(TestSchema2, validValue2).ok).toBe(true)
    expect(validateSchema(TestSchema2, validValue3).ok).toBe(true)
  })

  test("It should support null in schemas", () => {
    const TestSchema = null
    expect(validateSchema(TestSchema, null).ok).toBe(true)
    expect(validateSchema(TestSchema, "test").ok).toBe(false)

    const NestedTestSchema = {
      a: string,
      b: undefined,
      c: null
    };

    expect(validateSchema(NestedTestSchema, {
      a: "test",
      b: undefined,
      c: null
    }).ok).toBe(true)
    expect(validateSchema(NestedTestSchema, {
      a: "test",
      b: "test",
      c: 123
    }).ok).toBe(false)


    const ArrayOfNullSchema = array(null)
    expect(validateSchema(ArrayOfNullSchema, [null, null, null]).ok).toBe(true)
    expect(validateSchema(ArrayOfNullSchema, [1, null, 2]).ok).toBe(false)

  })


  test("It should support lots of nesting (10 levels)", () => {
    const TestSchema = {
      a: {
        test: number,
        b: {
          test: number,
          c: {
            test: number,
            d: {
              test: number,
              e: {
                test: number,
                f: {
                  test: number,
                  g: {
                    test: number,
                    h: {
                      test: number,
                      i: {
                        test: number,
                        j: {
                          test: number,
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    };
    const validTestSchema = {
      a: {
        test: 1,
        b: {
          test: 2,
          c: {
            test: 3,
            d: {
              test: 4,
              e: {
                test: 5,
                f: {
                  test: 6,
                  g: {
                    test: 7,
                    h: {
                      test: 8,
                      i: {
                        test: 9,
                        j: {
                          test: 10,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const validationResult = validateSchema(TestSchema, validTestSchema);
    expect(validationResult.ok).toBe(true)
  });

  test("It should fail validation for value with missing key in non-nested schema", () => {
    const TestSchema = {
      a: string,
      b: number,
      c: {
        test: string,
        bob: number,
      },
    };

    const testValue = {
      a: "a",
      c: {
        test: "test",
        bob: 5,
      },
    };

    const validationResult = validateSchema(TestSchema, testValue);
    expect(validationResult.ok).toBe(false)
  });


  test("It should fail validation for value with missing key in nested schema", () => {
    const TestSchema = {
      a: string,
      b: number,
      c: {
        test: string,
        bob: number,
      },
    };

    const testValue = {
      a: "a",
      b: 0,
      c: {
        bob: 5,
      },
    };

    const validationResult = validateSchema(TestSchema, testValue);
    expect(validationResult.ok).toBe(false)
  });
})
