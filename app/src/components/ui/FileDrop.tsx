import { DragEvent, useRef, useState } from 'react';
import clsx from 'clsx';
import { UploadIcon } from './Icon';

interface FileDropProps {
  accept?: string;
  onFile: (file: File) => void;
  hint?: string;
}

export function FileDrop({ accept, onFile, hint }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHover(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
        hover ? 'border-burgundy bg-burgundy-tint' : 'border-line bg-cream hover:border-burgundy hover:bg-burgundy-tint',
      )}
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={e => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Upload file"
    >
      <div className="mb-2 flex justify-center text-ink-light"><UploadIcon size={32} /></div>
      <div className="font-medium text-ink">Drop file here or click to browse</div>
      {hint && <div className="text-[13px] text-ink-light mt-1.5">{hint}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}
