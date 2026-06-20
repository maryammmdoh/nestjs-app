import { Module } from "@nestjs/common";
import { SecurityService } from "./security.service";
import { ConfigService } from "@nestjs/config";

@Module({
    providers: [SecurityService,ConfigService],
    exports: [SecurityService],
})
export class SecurityModule {}