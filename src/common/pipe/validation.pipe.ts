import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private _schema: ZodType) {}
    transform(value: any, metadata: ArgumentMetadata) {
    const {success, error, data} = this._schema.safeParse(value);
    if (!success) {
      throw new BadRequestException('validation failed',{
        cause: error.issues.map((issue)=> {
            return {
                path: issue.path,
                message: issue.message
            };
        }),
      });
    }
    return data;
  }
} 