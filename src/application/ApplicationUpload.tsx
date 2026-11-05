import { useEffect, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import {
  RiCheckLine, RiCloseLine, RiFileLine, RiFileImageLine, RiImageAddLine, RiUploadCloud2Line,
} from '@remixicon/react';
import { VaultBadge, VaultButton, VaultProgress } from '../base/VaultControls';
import { readableInk, rgbToHex } from '../base/colorMath';
import './ApplicationComponents.css';

/*
 * Upload — the drop zone Pallet uses for images and logos, as a reusable pattern.
 * Zone: 48 icon disc (chip + hairline), title 14/20, hint 12/16, dashed 12% hairline.
 * Files: full-bleed rows 56 with thumbnail, size badge, progress / status, remove.
 */

export type ApplicationUploadStatus = 'uploading' | 'done' | 'error';
export type ApplicationUploadItem = { id: string; name: string; size: number; type: string; status: ApplicationUploadStatus; progress: number; error?: string; previewUrl?: string };
/** Plug your transport: report 0–100 through onProgress, resolve when stored, reject to show an error. */
export type ApplicationUploader = (file: File, onProgress: (percent: number) => void) => Promise<void>;

const makeId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

/** True when the file matches an `accept` string (".svg,image/*,application/pdf"). */
export function fileMatchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept.split(',').map(rule => rule.trim().toLowerCase()).filter(Boolean).some(rule =>
    rule.startsWith('.') ? name.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule);
}

/** Local stand-in transport for specimens: progress in steps, never leaves the browser. */
export const simulateUpload: ApplicationUploader = (_file, onProgress) => new Promise(resolve => {
  let percent = 0;
  const timer = window.setInterval(() => {
    percent = Math.min(100, percent + 8 + Math.round(Math.random() * 16));
    onProgress(percent);
    if (percent >= 100) { window.clearInterval(timer); resolve(); }
  }, 160);
});

/** Drop zone only. Click or Enter opens the file picker; drag-over tints the zone. */
export function ApplicationDropzone({ label = 'Kéo thả tệp vào đây hoặc bấm để chọn', hint, accept, multiple = false, disabled = false, busy = false, icon, onFiles, compact = false, className = '' }: {
  label?: ReactNode;
  hint?: ReactNode;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Shows an indeterminate progress instead of the hint (analysing, uploading a single file). */
  busy?: boolean;
  icon?: ReactNode;
  onFiles: (files: File[]) => void;
  /** One 40px row (icon + label) for toolbars and headers; the hint is dropped. */
  compact?: boolean;
  className?: string;
}) {
  const [over, setOver] = useState(false);
  const accepting = !disabled && !busy;
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setOver(false);
    if (!accepting) return;
    const files = [...event.dataTransfer.files];
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  return <label
    className={`application-dropzone ${className}`.trim()}
    data-over={over || undefined}
    data-compact={compact || undefined}
    data-disabled={disabled || undefined}
    aria-busy={busy || undefined}
    onDragOver={event => { event.preventDefault(); if (accepting) setOver(true); }}
    onDragLeave={() => setOver(false)}
    onDrop={drop}
  >
    <input type="file" className="sr-only" accept={accept} multiple={multiple} disabled={!accepting} onChange={event => { const files = [...(event.target.files ?? [])]; if (files.length) onFiles(files); event.currentTarget.value = ''; }} />
    <span className="application-dropzone__icon" aria-hidden="true">{icon ?? <RiUploadCloud2Line />}</span>
    <strong>{over ? 'Thả để tải lên' : label}</strong>
    {!compact && (busy ? <VaultProgress label="Đang xử lý" loading /> : hint && <small>{hint}</small>)}
  </label>;
}

/**
 * Upload with a file list. Validates type (`accept`) and size (`maxSize`) before uploading;
 * rejected files stay in the list with the reason. `upload` is the transport; the default
 * simulates progress locally.
 */
export function ApplicationUpload({ label, hint, accept, maxSize = 5 * 1024 * 1024, multiple = true, disabled = false, upload = simulateUpload, defaultItems = [], onComplete }: {
  label?: ReactNode;
  hint?: ReactNode;
  accept?: string;
  /** Bytes. */
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  upload?: ApplicationUploader;
  defaultItems?: ApplicationUploadItem[];
  onComplete?: (item: ApplicationUploadItem) => void;
}) {
  const [items, setItems] = useState<ApplicationUploadItem[]>(defaultItems);
  const urls = useRef(new Set<string>());
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), []);
  const patch = (id: string, change: Partial<ApplicationUploadItem>) => setItems(list => list.map(item => item.id === id ? { ...item, ...change } : item));
  const add = (files: File[]) => {
    files.forEach(file => {
      const error = !fileMatchesAccept(file, accept) ? 'Định dạng không hỗ trợ' : file.size > maxSize ? `Lớn hơn ${formatBytes(maxSize)}` : undefined;
      const previewUrl = !error && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      if (previewUrl) urls.current.add(previewUrl);
      const item: ApplicationUploadItem = { id: makeId(), name: file.name, size: file.size, type: file.type, status: error ? 'error' : 'uploading', progress: 0, error, previewUrl };
      setItems(list => multiple ? [...list, item] : [item]);
      if (error) return;
      upload(file, percent => patch(item.id, { progress: percent }))
        .then(() => { patch(item.id, { status: 'done', progress: 100 }); onComplete?.({ ...item, status: 'done', progress: 100 }); })
        .catch((reason: unknown) => patch(item.id, { status: 'error', error: reason instanceof Error ? reason.message : 'Tải lên thất bại' }));
    });
  };
  const remove = (id: string) => setItems(list => {
    const item = list.find(entry => entry.id === id);
    if (item?.previewUrl && urls.current.has(item.previewUrl)) { URL.revokeObjectURL(item.previewUrl); urls.current.delete(item.previewUrl); }
    return list.filter(entry => entry.id !== id);
  });
  const limits = [accept?.split(',').map(rule => rule.trim().replace(/^\./, '').replace('image/*', 'Ảnh').toUpperCase()).join(', '), `tối đa ${formatBytes(maxSize)}`].filter(Boolean).join(' · ');
  return <div className="application-upload">
    <ApplicationDropzone label={label} hint={hint ?? limits} accept={accept} multiple={multiple} disabled={disabled} onFiles={add} />
    {items.length > 0 && <div className="application-panel is-framed">
      <div className="application-list" role="list" aria-label="Tệp tải lên">
        {items.map(item => <div role="listitem" className="application-upload__row" key={item.id} data-status={item.status}>
          {item.previewUrl
            ? <img className="application-upload__thumb" src={item.previewUrl} alt="" />
            : <span className="application-upload__thumb is-icon" aria-hidden="true">{item.type.startsWith('image/') ? <RiFileImageLine /> : <RiFileLine />}</span>}
          <span className="application-list__copy"><strong>{item.name}</strong>{item.status === 'error' && <small>{item.error}</small>}</span>
          <VaultBadge>{formatBytes(item.size)}</VaultBadge>
          {item.status === 'uploading' && <span className="application-upload__progress"><VaultProgress value={item.progress} label={`${item.name} ${item.progress}%`} /><VaultBadge>{`${item.progress}%`}</VaultBadge></span>}
          {item.status === 'done' && <VaultBadge tone="success"><RiCheckLine aria-hidden="true" />Xong</VaultBadge>}
          {item.status === 'error' && <VaultBadge tone="danger">Lỗi</VaultBadge>}
          <VaultButton appearance="text" size="sm" iconOnly className="vault-close" icon={<RiCloseLine />} aria-label={`${item.status === 'uploading' ? 'Hủy tải' : 'Gỡ'} ${item.name}`} onClick={() => remove(item.id)} />
        </div>)}
      </div>
    </div>}
  </div>;
}

/* ----------------------------------------------------------- Image palette */

type ExtractedColor = { hex: string; selected: boolean };

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Không đọc được ảnh'));
    image.src = url;
  });
}

/** Dominant colours of an image: 4-bit RGB bins, skip near-white / near-black / transparent, keep distinct ones. */
export async function extractImageColors(url: string, count = 5) {
  const image = await loadImage(url);
  const canvas = document.createElement('canvas');
  const ratio = Math.min(1, 180 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return [];
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const bins = new Map<string, { count: number; r: number; g: number; b: number }>();
  for (let index = 0; index < pixels.length; index += 16) {
    if (pixels[index + 3] < 180) continue;
    const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if ((max > 244 && min > 235) || max < 18) continue;
    const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
    const bin = bins.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bin.count += 1; bin.r += r; bin.g += g; bin.b += b; bins.set(key, bin);
  }
  const picked: Array<[number, number, number]> = [];
  for (const bin of [...bins.values()].sort((a, b) => b.count - a.count)) {
    const candidate: [number, number, number] = [bin.r / bin.count, bin.g / bin.count, bin.b / bin.count];
    if (picked.every(value => Math.hypot(candidate[0] - value[0], candidate[1] - value[1], candidate[2] - value[2]) > 48)) picked.push(candidate);
    if (picked.length === count) break;
  }
  return picked.map(([r, g, b]) => rgbToHex({ r, g, b }));
}

/**
 * Colours from an image (Pallet "Tải ảnh lên"). Drop an image → preview + extracted colours as
 * rows 56 (swatch-picker dot with check, HEX badge) → Hủy / Thêm màu. `defaultImage` opens straight in review.
 */
export function ApplicationImagePalette({ defaultImage, count = 5, onConfirm }: {
  defaultImage?: { name: string; url: string };
  count?: number;
  /** Selected colours, plus the image's file name (useful for naming the new colours). */
  onConfirm?: (hexes: string[], imageName: string) => void;
}) {
  const [image, setImage] = useState<{ name: string; url: string; colors: ExtractedColor[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(0);
  const ownUrl = useRef<string | null>(null);
  useEffect(() => () => { if (ownUrl.current) URL.revokeObjectURL(ownUrl.current); }, []);
  const analyse = async (name: string, url: string) => {
    setBusy(true); setError(''); setAdded(0);
    try {
      const colors = await extractImageColors(url, count);
      if (!colors.length) throw new Error('Ảnh không có màu đủ rõ để trích xuất');
      setImage({ name, url, colors: colors.map(hex => ({ hex, selected: true })) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không đọc được ảnh');
    } finally { setBusy(false); }
  };
  useEffect(() => { if (defaultImage) void analyse(defaultImage.name, defaultImage.url); }, [defaultImage?.url]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Chọn một tệp ảnh PNG, JPG hoặc WEBP'); return; }
    if (ownUrl.current) URL.revokeObjectURL(ownUrl.current);
    ownUrl.current = URL.createObjectURL(file);
    void analyse(file.name, ownUrl.current);
  };
  const toggle = (index: number) => setImage(current => current && { ...current, colors: current.colors.map((color, at) => at === index ? { ...color, selected: !color.selected } : color) });
  const selected = image?.colors.filter(color => color.selected) ?? [];

  if (!image) return <div className="application-upload">
    <ApplicationDropzone label="Tải ảnh lên" hint="Kéo thả hoặc bấm · PNG, JPG, WEBP" accept="image/*" busy={busy} icon={<RiImageAddLine />} onFiles={pick} />
    {error && <p className="application-upload__message" role="alert">{error}</p>}
    {added > 0 && <p className="application-upload__message is-success" role="status"><VaultBadge tone="success">{`Đã thêm ${added} màu`}</VaultBadge></p>}
  </div>;

  return <section className="application-panel is-framed application-image-palette" aria-label="Màu trích xuất từ ảnh">
    <header className="application-panel__header">
      <span className="application-image-palette__title"><strong>Màu từ ảnh</strong><small title={image.name}>{image.name}</small></span>
      <VaultBadge>{`${selected.length}/${image.colors.length}`}</VaultBadge>
    </header>
    <img className="application-image-palette__preview" src={image.url} alt={`Ảnh ${image.name}`} />
    <div className="application-list" role="list" aria-label="Các màu trích xuất">
      {image.colors.map((color, index) => <div role="listitem" key={`${color.hex}-${index}`}>
        <button
          type="button"
          className="application-image-palette__row"
          aria-pressed={color.selected}
          aria-label={`${color.selected ? 'Bỏ chọn' : 'Chọn'} ${color.hex}`}
          style={{ '--application-swatch': color.hex, '--application-swatch-ink': readableInk(color.hex) } as CSSProperties}
          onClick={() => toggle(index)}
        >
          <span className="application-image-palette__hit" aria-hidden="true"><span className="application-image-palette__dot">{color.selected && <RiCheckLine />}</span></span>
          <VaultBadge>{color.hex}</VaultBadge>
        </button>
      </div>)}
    </div>
    <footer className="application-image-palette__footer">
      <VaultButton appearance="ghost" onClick={() => setImage(null)}>Hủy</VaultButton>
      <VaultButton priority="primary" tone="brand" disabled={!selected.length} onClick={() => { onConfirm?.(selected.map(color => color.hex), image.name); setAdded(selected.length); setImage(null); }}>Thêm màu</VaultButton>
    </footer>
  </section>;
}
