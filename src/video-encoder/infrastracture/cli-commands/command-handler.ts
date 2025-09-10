import { CommandFactory } from 'nest-commander';
import { ProcessVideoModule } from '../processors/process-videos/process-video.module';

async function bootstrap() {

  await CommandFactory.runWithoutClosing(ProcessVideoModule, [
    'warn',
    'error',
  ]);
}

bootstrap();
