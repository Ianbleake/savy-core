import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	app.useLogger(app.get(Logger));

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	const configService = app.get(ConfigService);
	const corsOrigin = configService.get<string>("CORS_ORIGIN", "http://localhost:3000");

	app.enableCors({
		origin: corsOrigin,
		credentials: true,
	});

	app.setGlobalPrefix("api");

	// Swagger
	const swaggerConfig = new DocumentBuilder()
		.setTitle("Savy API")
		.setDescription("Personal finance management API")
		.setVersion("1.0")
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("api/docs", app, document);

	const port = configService.get<number>("PORT", 3001);
	await app.listen(port);
}
bootstrap();
