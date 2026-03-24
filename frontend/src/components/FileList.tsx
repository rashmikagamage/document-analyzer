import type { DriveFile } from "../api/drive";
import { FileCard } from "./FileCard";

type FileListProps = {
  files: DriveFile[];
  onAnalyze: (fileId: string) => void;
  activeFileId: string | null;
};

export function FileList({
  files,
  onAnalyze,
  activeFileId,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="empty-state">
        No PDF files were found in this Google Drive account.
      </div>
    );
  }

  return (
    <div className="grid file-grid">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onAnalyze={onAnalyze}
          loading={activeFileId === file.id}
        />
      ))}
    </div>
  );
}