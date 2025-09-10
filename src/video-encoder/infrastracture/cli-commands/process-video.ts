import { Command, CommandRunner, Option } from 'nest-commander';
import { ProcessVideoHandler } from '../processors/process-videos/process-videos';
interface BasicCommandOptions {
  limit: number;
}

@Command({ name: 'handle-videos', description: 'process-video' })
export class ProcessVideo extends CommandRunner {
  constructor(private readonly processVideoHandler:ProcessVideoHandler){

    super()
  }
  async run(
    passedParam: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    this.processVideoHandler.start();
  }

  @Option({
    flags: '-l, --limit <limit>',
    description: 'Limit option',
    defaultValue: 10,
  })
  parseLimit(val: string): number {
    return Number(val);
  }
}

