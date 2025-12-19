import { ICommand } from "@nestjs/cqrs";

export interface UploadVideoPayload {
  file: any;
  title?: string;
  description?: string;
  userId: string;
  originalName: string;
  filename: string;
  mimetype: string;
  sizeBytes: number;
  tags?: string[];
}

export class UploadVideoCommand implements ICommand {
  constructor(public readonly payload: UploadVideoPayload) { }
}