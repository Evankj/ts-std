import { Err, Ok, type Result } from "./result";

type ValidatorFunction<T> = (value: any) => value is T;
type SchemaValidator<T> = {
  validator: ValidatorFunction<T>;
  optional?: boolean;
}

type SchemaEntry<T> = SchemaValidator<T> | null | undefined;

export type InferTypeFromSchema<T> =
  T extends null ? null
  : T extends undefined ? undefined
  : T extends SchemaValidator<infer U>
  ? T['optional'] extends true
  ? U | undefined
  : U
  : T extends { [key: string]: any }
  ? { [K in keyof T]: T[K] extends null
    ? null
    : T[K] extends undefined
    ? undefined
    : T[K] extends SchemaValidator<infer U>
    ? T[K]['optional'] extends true
    ? U | undefined
    : U
    : T[K] extends { [key: string]: any }
    ? InferTypeFromSchema<T[K]>
    : never
  }
  : never;

class Validator<T> implements SchemaValidator<T> {
  optional: boolean = false;
  // This is important! It is used to figure out if the validator is in an object
  // Private so that it cannot be seen by users of the API
  private ___validatorTag___ = 1;
  validator: ValidatorFunction<T>;
  constructor(validatorFunction: ValidatorFunction<T>) {
    this.validator = validatorFunction;
  }
}

function createValidator<T>(validatorFunction: ValidatorFunction<T>): SchemaValidator<T> {
  return new Validator<T>(validatorFunction);
};

export const string: SchemaValidator<string> = createValidator((value) => typeof value === "string");
export const number: SchemaValidator<number> = createValidator((value) => typeof value === "number");
export const boolean: SchemaValidator<boolean> = createValidator((value) => typeof value === "boolean");

export const optional = <T>(validator: SchemaEntry<T>): SchemaEntry<T> => {
  if (!validator) return validator

  return {
    ...validator,
    optional: true,
  }
};

export const array = <T>(validator: SchemaEntry<T>): SchemaEntry<T[]> => {
  return createValidator((value): value is T[] => {
    if (!Array.isArray(value)) return false;

    return value.every(item => {
      if (validator === null) {
        return item === null
      }
      if (validator === undefined) {
        return item === undefined
      }
      return validator.validator(item)
    });
  });
};

export const union = <T extends any[]>(...validators: { [K in keyof T]: SchemaEntry<T[K]> }): SchemaValidator<T[number]> => {
  return createValidator((value): value is T[number] => {
    return validators.some(validator => validator === null ? null : validator === undefined ? undefined : validator.validator(value));
  });
};

type NestedSchemaValidator = {
  [key: string]: SchemaEntry<any> | NestedSchemaValidator
}

export const validateSchema = <T extends SchemaEntry<any> | NestedSchemaValidator>(schema: T, value: any): Result<
  InferTypeFromSchema<T>,
  { errors: string[] }
> => {

  if (schema === null) {
    if (value !== null) {
      return Err({
        errors: [
          `Expected null value, received ${value}`
        ]
      })
    }
    return (Ok(value));
  }

  if (schema === undefined) {
    if (value !== undefined) {
      return Err({
        errors: [
          `Expected undefined value, received ${value}`
        ]
      })
    }
    return (Ok(value));
  }

  // Handle single validator case
  if ((schema as any).___validatorTag___) {
    const validator = schema as SchemaValidator<any>;
    if (!validator.validator(value)) {
      return Err({
        errors: [`Invalid value. Expected ${validator.validator}, got ${typeof value}`]
      });
    }
    return Ok(value);
  }

  let errors: string[] = [];

  for (const key in schema) {


    if ((schema as T)![key] === null) {
      if (value[key] !== null) {
        errors.push(`Expected null value, received ${value}`)
      }
      continue;
    }

    if ((schema as T)![key] === undefined) {
      if (value[key] !== undefined) {
        errors.push(`Expected undefined value, received ${value}`)
      }
      continue;
    }

    const validator = (schema as T)![key];

    // We are looking at an individual validator
    if ((validator as any).___validatorTag___) {
      const fieldValidator = validator as SchemaValidator<any>;
      if (value[key] === undefined) {
        if (!fieldValidator.optional) {
          errors.push(`Non-optional field "${key}" of type ${fieldValidator.validator} is missing`)
        }
      } else {
        if (!fieldValidator.validator(value[key])) {
          errors.push(`Invalid type for field "${key}". Expected ${validator}, got ${typeof value[key]}`)
        }
      }
    } else {
      // We are looking at an object which contains validators
      const nestedSchemaObject = validator as {
        [key: string]: SchemaValidator<any>
      };
      if (nestedSchemaObject.hasOwnProperty(key)) {
        if (!value.hasOwnProperty(key)) {
          errors.push(`Provided value is missing key: "${key}"`)
        }
      } else {
        const nestedValidationResult = validateSchema(nestedSchemaObject, value[key]);
        if (!nestedValidationResult.ok) {
          errors.push(...nestedValidationResult.error.errors)
        }
      }
    }
  }

  if (errors.length > 0) return Err({ errors });

  return Ok(value)
};

