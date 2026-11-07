# 02 — Color engine và quy tắc đặt variable

## Tư duy hệ màu

Hệ màu AISEE tách bốn tầng:

```text
Primitive → Semantic token → Runtime contract → Component
```

Ví dụ:

```text
#B30000
  → primitive/primary-500
  → action/primary hoặc subtle-bg/brand-primary
  → --vault-action / --ds-color-action
  → VaultButton
```

Primitive trả lời “màu gì”. Semantic trả lời “dùng để làm gì”. Runtime contract là điểm nối giữa theme được sinh và thư viện. Component chỉ tiêu thụ contract.

## Mô hình màu của Pallet

Pallet dùng nhiều không gian màu cho đúng việc:

- RGB/hex: nhập, xuất và tương thích CSS.
- HSL: đọc hue/saturation/lightness và tạo companion ban đầu.
- OKLab: nội suy thang màu để thay đổi cảm nhận đều hơn RGB/HSL.
- Relative luminance: tính contrast theo WCAG.

Black chuẩn của hệ là `#050505`, không dùng đen tuyệt đối `#000000`. Hàm normalize tự chuyển `#000000` thành `#050505` để dark surface vẫn còn chiều sâu.

## Tạo companion palette

Từ màu primary, engine luân phiên bốn sơ đồ hòa sắc có kiểm soát:

| Sơ đồ | Góc hue |
|---|---|
| Split complementary | +150°, +210° |
| Analogous | +34°, -34° |
| Triadic | +120°, +240° |
| Complementary accent | +180°, +62° |

Sau khi quay hue:

- saturation được giữ trong khoảng 0.38–0.76;
- lightness được giữ trong khoảng 0.30–0.68;
- primitive đã lock không bị đổi;
- primitive chưa lock được sinh lại theo seed một cách deterministic.

Kết quả vì vậy tái lập được, không phải random mỗi lần mở tool.

## Sinh thang màu

Mỗi primitive có 11 step:

```text
50 100 200 300 400 500 600 700 800 900 950
```

Step `500` là màu gốc. Các step sáng mix trong OKLab về trắng; các step tối mix về màu có lightness xấp xỉ `0.08`.

| Step | Tỉ lệ mix |
|---:|---:|
| 50 | 94% |
| 100 | 86% |
| 200 | 70% |
| 300 | 51% |
| 400 | 27% |
| 500 | 0% |
| 600 | 12% |
| 700 | 26% |
| 800 | 41% |
| 900 | 56% |
| 950 | 70% |

Không tự pha từng step bằng mắt. Nếu step chưa tốt, sửa seed/constraint hoặc thuật toán rồi sinh lại toàn scale.

## Contrast và cách chọn cặp

Ngưỡng hiện tại:

- text thông thường: 4.5:1;
- semantic/text ưu tiên: 7:1;
- non-text UI: 3:1;
- tone pair: 7:1.

Engine xếp hạng preview theo thứ tự:

1. cặp quan trọng yếu nhất;
2. số cặp đạt chuẩn;
3. chất lượng hòa sắc;
4. chất lượng tổng.

Điều này tránh trường hợp điểm trung bình đẹp nhưng một cặp text quan trọng bị fail.

### Brand surface

`brandSurfacePair` ưu tiên chữ trắng. Chỉ dùng chữ đen khi contrast đạt ít nhất 10:1. Nếu màu 500 không đủ, surface token được đi xuống step tối hơn. **Primitive brand không bị sửa**; semantic surface được phép chọn step phù hợp.

### UI accent

`uiAccentPair` cố ở gần step 500 nhất nhưng phải đạt ít nhất 3:1 với canvas để control/focus vẫn nhìn được.

### Semantic color

Semantic color neo vào hue quen thuộc:

- info: `#0A84FF`;
- danger/alert: `#FF453A`;
- warning: `#FF9F0A`;
- success: `#30D158`.

Engine mượn một phần saturation/lightness của brand và chỉ bias hue nhẹ. Vì vậy semantic state vẫn được nhận biết xuyên profile, nhưng không lạc khỏi palette tổng.

### Category color

Category color dùng để phân nhóm dữ liệu, không biểu thị thành công/cảnh báo/lỗi. Engine tránh các dải hue semantic và sinh deterministic theo `categoryVariation` (mặc định 3).

Không dùng category token cho trạng thái. Không dùng danger token chỉ vì cần “một màu đỏ đẹp”.

## Các mode

Pallet hiểu các môi trường:

```text
super-dark, dark, light, light-sunken, brand, cool, warm
```

Theme production hiện ship light/dark. System preference là fallback; app có thể scope một subtree bằng `data-theme-scope`. Màu được tính ở build time, không chạy color math khi app boot.

## Taxonomy token

Các group chuẩn:

| Group | Ý nghĩa | Ví dụ |
|---|---|---|
| `primitive` | màu nguyên liệu, có scale | `primitive/primary-500` |
| `semantic` | cặp trạng thái theo mode | `semantic/success-dark` |
| `text` | vai trò chữ/icon | `text/body`, `text/on-brand` |
| `category` | phân nhóm dữ liệu | `category/finance-light` |
| `system-bg` | tầng surface hệ thống | `system-bg/fg-base` |
| `subtle-bg` | nền tint nhẹ | `subtle-bg/brand-primary` |
| `border` | đường biên/divider/focus support | `border/alpha-divider` |

Token text chuẩn gồm:

```text
text/heading
text/title
text/body
text/muted
text/disabled
text/brand-primary
text/on-brand
text/{info|success|warning|alert}
text/on-semantic-{role}-{light|dark}
text/on-category-{slug}-{light|dark}
```

Surface và border chuẩn:

```text
system-bg/fg-under
system-bg/fg-alpha
system-bg/fg-base
system-bg/fg-alt
system-bg/fg-weak
system-bg/modal

subtle-bg/brand-primary
subtle-bg/alpha-{info|success|warning|alert}

border/alpha-subtle
border/alpha-neutral
border/alpha-divider
border/alpha-strong
border/{info|success|warning|alert}
```

Alpha mặc định quan trọng:

- `system-bg/fg-alpha`: 5%;
- border subtle/neutral/divider/strong: 6% / 10% / 12% / 18%.

## Quy tắc đặt tên variable

### Công thức

```text
{group}/{role}-{variant}-{mode}
```

Chỉ thêm phần khi nó mang nghĩa. Tên phải trả lời vai trò trước, hình thức sau.

Tốt:

```text
text/body
border/alpha-divider
category/logistics-dark
semantic/warning-light
```

Không tốt:

```text
gray2
redButton
cardBorderDarkNew
color-final-3
```

### Quy tắc từ vựng

- dùng lowercase kebab-case;
- dùng `/` để chia group;
- dùng tên role ổn định: `body`, `muted`, `danger`, `surface`, `divider`;
- không gắn tên màn hình vào token nền;
- không gắn giá trị hex vào tên;
- `light|dark` chỉ mô tả mode/cặp thật sự, không mô tả cảm giác chủ quan;
- alias semantic thay vì copy value.

### CSS serialization

Khi xuất CSS, `/` được đổi thành `-`:

```text
text/body → --text-body
border/alpha-divider → --border-alpha-divider
```

Alias được xuất thành `var(--...)`. Token có opacity dùng:

```css
color-mix(in srgb, <value> <opacity>%, transparent)
```

Thứ tự mode khi export ổn định:

```text
light → light-sunken → dark → super-dark → brand → cool → warm
```

### DTCG/Figma serialization

Đường dẫn token được tách thành object lồng nhau. Alias CSS trở thành alias DTCG dạng `{group.token}`. Opacity được chuẩn hóa và description được giữ lại để người thiết kế hiểu vai trò, không chỉ thấy giá trị.

## Ba namespace runtime

Hệ hiện có ba lớp tên vì mỗi lớp có trách nhiệm khác nhau:

1. Pallet xuất semantic value.
2. AISEE Core map vào runtime `--vault-*`.
3. Design System map thành public contract `--ds-*`.

Component của thư viện chỉ dùng `--ds-*`. App không chọc trực tiếp vào primitive nội bộ của Pallet. Cầu nối này cho phép đổi engine hoặc profile mà không sửa từng component.

## Quy trình đưa màu vào production

1. Chọn/lock primitive trong Pallet.
2. Sinh scale và companion.
3. Kiểm tra contrast, semantic và category collision.
4. Chỉnh tone cho light/dark bằng tool, không sửa CSS output.
5. Build `theme.css` và `tokens.manifest.json` bằng `themeExport.ts`.
6. Map semantic output vào `--vault-*` và `--ds-*`.
7. Chạy specimen component ở default/hover/focus/loading/disabled và cả light/dark.
8. Commit config nguồn cùng file generated để có thể truy vết.

## Luật không được phá

- Không sửa tay `theme.css` generated.
- Không dùng hex trực tiếp trong component khi đã có semantic role.
- Không cho mỗi Mini App tự phát minh semantic hue.
- Không đổi primitive brand để cứu contrast của một surface; chọn semantic step đúng.
- Không dùng opacity để “làm dịu” text nếu khiến contrast fail.
- Không thêm token chỉ phục vụ đúng một pixel của một màn hình; trước hết kiểm tra role đã tồn tại chưa.
