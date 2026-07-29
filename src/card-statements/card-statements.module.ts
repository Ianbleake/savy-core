import { Module } from "@nestjs/common";
import { CardStatementsController } from "./card-statements.controller";
import { CardStatementsService } from "./card-statements.service";

@Module({
	providers: [CardStatementsService],
	controllers: [CardStatementsController],
	exports: [CardStatementsService],
})
export class CardStatementsModule {}
