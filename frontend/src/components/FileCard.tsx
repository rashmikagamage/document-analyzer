import type { DriveFile } from "../api/drive";
import { Button } from "./Button";

type FileCardProps = {
  file: DriveFile;
  onAnalyze: (fileId: string) => void;
  loading: boolean;
};

function formatBytes(size?: string) {
  if (!size) {
    return "Unknown";
  }

  const bytes = Number(size);
  if (Number.isNaN(bytes)) {
    return size;
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function FileCard({ file, onAnalyze, loading }: FileCardProps) {
  return (
    <article className="file-card">
      <div className="file-card__top">
        <h3 className="file-card__title">{file.name}</h3>
        <span className="file-badge">PDF</span>
      </div>

      <div className="meta-list">
        <div className="meta-item">
          <span>Modified</span>
          <span>{formatDate(file.modifiedTime)}</span>
        </div>

        <div className="meta-item">
          <span>Size</span>
          <span>{formatBytes(file.size)}</span>
        </div>

        <div className="meta-item">
          <span>Type</span>
          <span>{file.mimeType}</span>
        </div>
      </div>

      <div className="file-card__actions">
        <Button
          variant="primary"
          onClick={() => onAnalyze(file.id)}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </Button>

        {file.webViewLink ? (
          <a href={file.webViewLink} target="_blank" rel="noreferrer">
            <Button variant="secondary" type="button">
              Open in Drive
            </Button>
          </a>
        ) : null}
      </div>
    </article>
  );
}