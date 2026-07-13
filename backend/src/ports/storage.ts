export interface UploadIntent {
  objectKey: string;
  uploadUrl: string;
  expiresAt: Date;
}

export interface FileStorage {
  createUploadIntent(input: { organizationId: string; evidenceId: string; versionId: string; fileName: string; contentType: string }): Promise<UploadIntent>;
  createDownloadUrl(objectKey: string): Promise<string>;
  delete(objectKey: string): Promise<void>;
}

export interface JobQueue {
  publish<T>(type: string, payload: T): Promise<void>;
}

export interface EmailSender {
  send(input: { to: string; subject: string; text: string }): Promise<void>;
}

// AWS adapters will implement these ports with S3, SQS/EventBridge, and SES.
