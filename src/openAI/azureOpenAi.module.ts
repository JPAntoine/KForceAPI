import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AzureOpenAIService } from 'src/openAI/services/azureOpenAI.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AzureOpenAIService],
  exports: [AzureOpenAIService],
})
export class JobsModule {}
