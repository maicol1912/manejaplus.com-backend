import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

interface KeyValidationOptions extends ValidationOptions {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
}

export function HasKey(options: KeyValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'hasKey',
      target: object.constructor,
      propertyName: propertyName,
      options,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'object' || value === null) return false;

          const hasKey = options.key in value;
          if (!hasKey) return false;

          const expectedType = options.type;
          switch (expectedType) {
            case 'string':
              return typeof value[options.key] === 'string';
            case 'number':
              return typeof value[options.key] === 'number';
            case 'boolean':
              return typeof value[options.key] === 'boolean';
            case 'object':
              return typeof value[options.key] === 'object' && value[options.key] !== null;
            default:
              return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          if (!(options.key in args.value)) {
            return `El campo ${args.property} debe contener la propiedad '${options.key}'.`;
          }

          const expectedType = options.type;
          return `La propiedad '${options.key}' en el campo ${args.property} debe ser de tipo '${expectedType}'.`;
        },
      },
    });
  };
}
