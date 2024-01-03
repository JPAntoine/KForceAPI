import { Module } from '@nestjs/common';
import { DocsController } from './controllers/docs.controller';
import { DocsService } from './services/docs/docs.service';

@Module({
  imports: [],
  controllers: [DocsController],
  providers: [DocsService],
})
export class AppModule {}
