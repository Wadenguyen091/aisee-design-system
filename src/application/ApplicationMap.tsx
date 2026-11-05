import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  RiAddLine, RiArrowDownSFill, RiBookmarkLine, RiCloseLine, RiCompass3Line, RiFocus3Line, RiMapPinFill,
  RiPlantLine, RiRouteLine, RiSchoolLine, RiStackLine, RiStore2Line, RiSubtractLine,
} from '@remixicon/react';
import { VaultBadge, VaultButton, VaultSearch, VaultSwitch } from '../base/VaultControls';
import { VaultPopover, VaultPopoverSection } from '../base/VaultOverlays';
import './ApplicationComponents.css';

type Category = 'amenity' | 'school' | 'park';
type Place = { id: string; name: string; category: Category; x: number; y: number; address: string; distance: string };
const PLACES: Place[] = [
  { id: 'p1', name: 'SALA Central Park', category: 'park', x: 44, y: 46, address: 'Đường Mai Chí Thọ, Thủ Thiêm', distance: '450 m' },
  { id: 'p2', name: 'Trường Quốc tế Thủ Thiêm', category: 'school', x: 66, y: 30, address: 'Đường B4, Khu Sala', distance: '1.2 km' },
  { id: 'p3', name: 'Sala Plaza', category: 'amenity', x: 30, y: 66, address: 'Đường Nguyễn Cơ Thạch', distance: '800 m' },
  { id: 'p4', name: 'Bến du thuyền', category: 'amenity', x: 20, y: 34, address: 'Bờ sông Sài Gòn', distance: '1.6 km' },
  { id: 'p5', name: 'Công viên bờ sông', category: 'park', x: 74, y: 70, address: 'Đường Trần Bạch Đằng', distance: '2.1 km' },
];
const CATEGORY: Record<Category, { label: string; icon: ReactNode }> = {
  amenity: { label: 'Tiện ích', icon: <RiStore2Line /> },
  school: { label: 'Trường học', icon: <RiSchoolLine /> },
  park: { label: 'Công viên', icon: <RiPlantLine /> },
};
const ZONES = [
  { key: 'residential', label: 'Nhà ở', count: 14 },
  { key: 'commercial', label: 'Thương mại', count: 6 },
  { key: 'park', label: 'Cây xanh', count: 9 },
  { key: 'education', label: 'Giáo dục', count: 3 },
] as const;
type Style = 'map' | 'satellite' | 'terrain';
const STYLES: Array<{ value: Style; label: string }> = [{ value: 'map', label: 'Bản đồ' }, { value: 'satellite', label: 'Vệ tinh' }, { value: 'terrain', label: 'Địa hình' }];
const SCALE = ['400 m', '200 m', '100 m', '50 m'];

/**
 * Map control kit over a master-plan map: search + category chips (top-left),
 * layer switcher (top-right), zoom / locate / compass stack (right), scale + coordinates
 * (bottom-left), legend (bottom-right) and a place card for the selected pin.
 */
export function ApplicationMapControls() {
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [bearing, setBearing] = useState(-16);
  const [style, setStyle] = useState<Style>('map');
  const [layers, setLayers] = useState({ zones: true, roads: true, labels: true });
  const [categories, setCategories] = useState<Category[]>(['amenity', 'school', 'park']);
  const [selected, setSelected] = useState<string | null>('p1');
  const [layersOpen, setLayersOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [located, setLocated] = useState(false);
  const place = PLACES.find(item => item.id === selected);
  const visible = PLACES.filter(item => categories.includes(item.category) && (!query || item.name.toLowerCase().includes(query.toLowerCase())));
  const transform = { '--map-zoom': .84 + zoom * .2, '--map-bearing': `${bearing}deg` } as CSSProperties;
  return <div className="application-map" data-style={style}>
    <div className="application-map__canvas" style={transform} aria-hidden="true">
      <svg viewBox="0 0 960 560" preserveAspectRatio="xMidYMid slice">
        <rect width="960" height="560" className="map-land" />
        <path className="map-water" d="M0 120 C140 150 210 250 190 360 C175 450 230 520 320 560 L0 560 Z" />
        {layers.zones && <g className="map-zones">
          <path data-zone="residential" d="M300 80 L520 70 L540 210 L330 230 Z" />
          <path data-zone="commercial" d="M250 330 L430 300 L460 470 L280 500 Z" />
          <path data-zone="park" d="M350 240 L560 225 L580 300 L440 300 Z" />
          <path data-zone="education" d="M580 90 L760 100 L750 220 L590 210 Z" />
          <path data-zone="residential" d="M600 250 L820 240 L840 380 L620 400 Z" />
          <path data-zone="park" d="M620 420 L860 400 L900 540 L640 540 Z" />
          <path data-zone="commercial" d="M780 110 L940 120 L940 230 L800 230 Z" />
        </g>}
        {layers.roads && <g className="map-roads">
          <path className="is-main" d="M200 290 C400 280 600 230 960 235" />
          <path className="is-main" d="M560 0 C565 200 590 380 600 560" />
          <path d="M260 60 L300 540" /><path d="M300 150 L960 170" /><path d="M240 420 L960 395" /><path d="M760 0 L780 560" />
        </g>}
        {layers.labels && <g className="map-labels">
          <text x="70" y="300">Sông Sài Gòn</text><text x="610" y="226">Mai Chí Thọ</text><text x="380" y="150">Khu ở A</text><text x="640" y="160">Khu giáo dục</text>
        </g>}
      </svg>
      {visible.map(item => <button
        key={item.id}
        type="button"
        tabIndex={-1}
        className="application-map__pin"
        data-category={item.category}
        data-selected={item.id === selected || undefined}
        style={{ left: `${item.x}%`, top: `${item.y}%` }}
        onClick={() => setSelected(item.id)}
      ><RiMapPinFill /></button>)}
      {located && <span className="application-map__me" style={{ left: '52%', top: '56%' }} />}
    </div>

    {/* Pins are decorative inside the scaled canvas; this list is the accessible way to pick a place. */}
    <div className="sr-only"><ul>{visible.map(item => <li key={item.id}><button type="button" onClick={() => setSelected(item.id)}>{item.name}</button></li>)}</ul></div>

    <div className="application-map__top-left">
      <VaultSearch label="Tìm địa điểm" placeholder="Tìm địa điểm…" value={query} onChange={event => setQuery(event.target.value)} onClear={() => setQuery('')} />
      <div className="application-map__chips" role="group" aria-label="Loại địa điểm">
        {(Object.keys(CATEGORY) as Category[]).map(key => <button key={key} type="button" className="application-chip is-toggle" aria-pressed={categories.includes(key)} onClick={() => setCategories(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key])}>{CATEGORY[key].icon}<span>{CATEGORY[key].label}</span></button>)}
      </div>
      {place && <article className="application-map__card">
        <header><span className="application-map__card-icon" data-category={place.category}>{CATEGORY[place.category].icon}</span><span><strong>{place.name}</strong><small>{CATEGORY[place.category].label} · {place.distance}</small></span><VaultButton appearance="text" size="sm" iconOnly icon={<RiCloseLine />} aria-label="Đóng thẻ địa điểm" onClick={() => setSelected(null)} /></header>
        <p>{place.address}</p>
        <footer><VaultButton appearance="ghost" size="sm" icon={<RiBookmarkLine />}>Lưu</VaultButton><VaultButton priority="primary" tone="brand" size="sm" icon={<RiRouteLine />}>Chỉ đường</VaultButton></footer>
      </article>}
    </div>

    <div className="application-map__top-right">
      <VaultPopover
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
        width={280}
        title="Lớp bản đồ"
        trigger={<VaultButton appearance="ghost" className="application-map__float" icon={<RiStackLine />} aria-haspopup="dialog" aria-expanded={layersOpen} onClick={() => setLayersOpen(value => !value)}>Lớp</VaultButton>}
      >
        <VaultPopoverSection label="Kiểu nền">
          <div className="application-map__styles" role="radiogroup" aria-label="Kiểu nền">
            {STYLES.map(item => <button key={item.value} type="button" role="radio" aria-checked={style === item.value} data-style={item.value} onClick={() => setStyle(item.value)}><i aria-hidden="true" /><span>{item.label}</span></button>)}
          </div>
        </VaultPopoverSection>
        <VaultPopoverSection label="Hiển thị">
          <VaultSwitch checked={layers.zones} onChange={value => setLayers(current => ({ ...current, zones: value }))} label="Phân khu chức năng" />
          <VaultSwitch checked={layers.roads} onChange={value => setLayers(current => ({ ...current, roads: value }))} label="Giao thông" />
          <VaultSwitch checked={layers.labels} onChange={value => setLayers(current => ({ ...current, labels: value }))} label="Nhãn địa danh" />
        </VaultPopoverSection>
      </VaultPopover>
    </div>

    <div className="application-map__zoom" role="group" aria-label="Điều khiển bản đồ">
      <button type="button" aria-label="Phóng to" disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + 1))}><RiAddLine /></button>
      <button type="button" aria-label="Thu nhỏ" disabled={zoom <= 0} onClick={() => setZoom(value => Math.max(0, value - 1))}><RiSubtractLine /></button>
      <button type="button" aria-label="Vị trí của tôi" aria-pressed={located} onClick={() => setLocated(value => !value)}><RiFocus3Line /></button>
      <button type="button" aria-label={`Hướng bắc (đang xoay ${bearing}°)`} onClick={() => setBearing(value => value === 0 ? -16 : 0)}><RiCompass3Line style={{ transform: `rotate(${bearing}deg)` }} /></button>
    </div>

    <div className="application-map__status">
      <span className="application-map__scale"><i />{SCALE[zoom]}</span>
    </div>

    {layers.zones && <section className="application-map__legend" data-open={legendOpen || undefined}>
      <button type="button" aria-expanded={legendOpen} onClick={() => setLegendOpen(value => !value)}><strong>Chú giải</strong><RiArrowDownSFill aria-hidden="true" /></button>
      {legendOpen && <ul>{ZONES.map(zone => <li key={zone.key}><i data-zone={zone.key} /><span>{zone.label}</span><VaultBadge tone="category">{zone.count}</VaultBadge></li>)}</ul>}
    </section>}
  </div>;
}
