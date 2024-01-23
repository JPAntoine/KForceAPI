import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AppConstants } from './common/constants';

dotenv.config();
if (AppConstants.isDev === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  const options = new DocumentBuilder()
    .setTitle('DIP API')
    .setDescription('DIP API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: function (origin, callback) {
      try {
        const whiteListOrigins = JSON.parse(process.env.AllowedURL);
        if (!origin || whiteListOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      } catch {
        if (!origin || process.env.AllowedURL == origin) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders:
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,X-Forwarded-for',
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
