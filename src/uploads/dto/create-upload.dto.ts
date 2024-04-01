// dto/create-upload.dto.ts
export class CreateUploadDto {
  readonly fileName: string;
  readonly filePath: string;
  readonly mimeType: string;
  readonly size: number;
}
