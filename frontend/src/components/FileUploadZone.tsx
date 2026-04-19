import { type ChangeEvent, type DragEvent, useCallback, useState } from 'react';
import type { CSSProperties } from 'react';

type Props = {
  accept?: string;
  onFilesSelected: (files: FileList | null) => void;
  disabled?: boolean;
};

export default function FileUploadZone({
  accept = '.csv,.json,.txt',
  onFilesSelected,
  disabled,
}: Props) {
  const [active, setActive] = useState(false);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setActive(false);
      if (disabled) return;
      onFilesSelected(e.dataTransfer.files);
    },
    [disabled, onFilesSelected]
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(e.target.files);
    e.target.value = '';
  };

  return (
    <div
      style={{
        ...styles.zone,
        borderColor: active ? 'var(--app-accent, #6b8f71)' : 'var(--app-border, #ddd)',
        opacity: disabled ? 0.6 : 1,
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept={accept}
        style={styles.input}
        onChange={onChange}
        disabled={disabled}
        aria-label="Upload flashcard file"
      />
      <p style={styles.text}>Drag and drop a file here, or click to browse</p>
      <p style={styles.hint}>Accepted: {accept}</p>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  zone: {
    position: 'relative',
    border: '2px dashed',
    borderRadius: 12,
    padding: '28px 20px',
    textAlign: 'center',
    backgroundColor: 'var(--app-surface, #fafafa)',
    transition: 'border-color 0.15s ease',
  },
  input: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
  text: {
    margin: 0,
    fontSize: 15,
    color: 'var(--app-fg, #333)',
    fontFamily: 'sans-serif',
    pointerEvents: 'none',
  },
  hint: {
    margin: '8px 0 0 0',
    fontSize: 12,
    color: 'var(--app-muted, #888)',
    fontFamily: 'sans-serif',
    pointerEvents: 'none',
  },
};
