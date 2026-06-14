import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'Matchdata', async: false })
export class Matchdata implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return value == args.object[args.constraints[0]]; // here you can add more complex validation rules, for example to check if password and confirm password are the same
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `${args.property} must match ${args.constraints[0]}`;
  }
}

export function IsMatchdata(
  field: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: field,
      validator: Matchdata,
    });
  };
}
