# 03 — Kinh nghiệm dựng component

## Component không bắt đầu từ JSX

Trước khi code, viết một contract ngắn:

```text
Purpose     Component giải việc gì?
Layer       Base, application, feature, screen hay specimen?
Anatomy     Các vùng bắt buộc và optional?
States      Default, hover, focus, loading, disabled, error, empty...?
Behavior    Mouse, touch, keyboard, focus, close/open?
Tokens      Semantic role nào được dùng?
Responsive  Co lại, wrap, stack hay đổi composition?
Ownership   Nằm ở Design System hay app?
```

Nếu chưa trả lời được, component chưa sẵn sàng để dựng.

## Năm lớp component

### Base

Primitive có contract ổn định, ít biết nghiệp vụ: `VaultButton`, `VaultField`, `VaultMenu`, `VaultDialog`, `VaultSheet`, `VaultBadge`.

Base chịu trách nhiệm:

- semantic HTML;
- state và keyboard behavior;
- accessibility;
- size/tone/appearance đã khai báo;
- token contract;
- reduced motion.

### Application

Composition lặp lại trong một category sản phẩm: topbar, profile menu, finance row, tactical command, folder, AI prompt.

Application component được phép khác hẳn giữa VEX và MAGASIN. Nó tái dùng base khi phù hợp nhưng có anatomy, data model và density riêng.

### Feature

Mang workflow/nghiệp vụ cụ thể như comment layer, Draft canvas hay admin taxonomy. Feature có thể compose application và base nhưng không tự nhận là Design System component.

### Screen

Điều phối route, data và layout của cả màn hình. Screen không nên định nghĩa lại primitive.

### Specimen

Chỉ dùng để trình bày và QA contract. Specimen không phải production component và không được trở thành dependency của app.

## Thiết kế API theo nghĩa

Ưu tiên prop có nghĩa:

```tsx
<VaultButton
  priority="primary"
  tone="danger"
  appearance="solid"
  loading={saving}
>
  Xóa
</VaultButton>
```

Tránh prop mô tả CSS:

```tsx
<Button red rounded shadow compact />
```

Các trục variant phải độc lập và hữu hạn:

- `priority`: primary/secondary;
- `tone`: brand/neutral/danger/semantic;
- `appearance`: solid/soft/ghost/text;
- `size`: sm/md;
- `state`: dùng HTML/state prop thật như `disabled`, `loading`, `aria-pressed`.

Không tạo boolean cho mọi tổ hợp. Nếu hai biến thể khác anatomy hoặc behavior đáng kể, đó có thể là hai component.

## Anatomy ổn định, slot có giới hạn

Một component tốt cho phép thay nội dung nhưng không làm vỡ cấu trúc.

Ví dụ dialog có contract:

```text
backdrop
└─ panel
   ├─ header: icon + heading + close
   ├─ body
   └─ footer (optional)
```

`size`, `tone`, `align`, `dismissOnBackdrop` là quyết định có nghĩa. Không truyền class tùy ý vào từng node con để screen tự viết lại anatomy.

Khi list/menu cần full bleed, cung cấp `flush` hoặc section contract rõ thay vì dùng negative margin rải rác.

## State phải được thiết kế cùng lúc

Mỗi interactive component tối thiểu kiểm tra:

```text
default
hover
focus-visible
pressed/selected
loading
disabled
error (nếu có input/data)
```

Loading phải:

- giữ nguyên kích thước control;
- chặn submit lặp;
- dùng `aria-busy` khi phù hợp;
- không làm label nhảy;
- có reduced-motion fallback.

Disabled không chỉ giảm opacity đến mức biến mất. Selected không được dựa duy nhất vào màu; dùng `aria-current`, `aria-selected`, `aria-pressed` hoặc checkmark đúng vai trò.

## Accessibility implementation

### Field

- Luôn có label; có thể visually hidden nhưng accessible name phải tồn tại.
- Hint/error có id ổn định và nối bằng `aria-describedby`.
- Error bật `aria-invalid`.
- Loading/disabled phản ánh xuống input thật.

### Dialog và sheet

- `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`.
- Khi mở: nhớ opener, đưa focus vào nội dung hữu ích đầu tiên.
- Tab/Shift+Tab bị giữ trong panel.
- Escape đóng, trừ lúc IME đang compose.
- Khi đóng: trả focus về opener nếu còn trong DOM.
- Form không mặc định dismiss khi click backdrop để tránh mất dữ liệu.

### Menu

- Dùng `role="menu"` và `menuitem/menuitemradio/menuitemcheckbox` đúng loại.
- Arrow Up/Down, Home/End di chuyển giữa item.
- Escape và Tab đóng floating menu.
- Input nằm trong menu giữ phím chỉnh sửa của nó.
- Event không được rơi xuyên xuống shortcut của canvas/page.

### Icon button

Icon trang trí dùng `aria-hidden`; button có `aria-label`. Tooltip không thay thế accessible name.

## CSS và token

Component CSS chỉ dùng semantic `--ds-*` cho màu, spacing, type, geometry và motion. Dùng `data-*` để biểu diễn trục variant/state:

```css
.vault-button[data-size='sm'] { ... }
.vault-button[data-tone='danger'] { ... }
.vault-button[data-loading='true'] { ... }
```

Lợi ích:

- DOM tự mô tả;
- specimen ép state dễ;
- selector không phụ thuộc thứ tự class;
- theme/profile override tại boundary rõ hơn.

Không dùng inline style cho hệ thống màu. Inline style chỉ phù hợp với dữ liệu runtime thật như tọa độ, width do người dùng chọn hoặc CSS custom property có giá trị động.

## Responsive không phải scale nhỏ

Chọn một trong bốn hành vi và ghi vào contract:

- **reflow**: đổi số cột;
- **wrap**: toolbar xuống dòng;
- **stack**: vùng ngang thành dọc;
- **replace**: desktop composition đổi thành mobile composition.

Ẩn label chỉ khi icon vẫn đủ nghĩa và có accessible name. Với touch/hover-none, action vốn chỉ hiện khi hover phải luôn nhìn thấy.

## Quy tắc phân hóa profile

### Base component

Chỉ dùng chung khi purpose, anatomy và interaction contract thực sự giống. Profile có thể override token đã khai báo; không copy component chỉ để đổi màu.

### Application component

Phải phân hóa theo category và style. VEX tactical component không được hiển thị application component của AISEE chỉ vì đang dùng chung trang Design System. Profile selector phải đổi dataset/specimen application tương ứng, còn shell trang vẫn giữ AISEE.

Nếu profile chưa có application component, hiển thị trạng thái “chưa định nghĩa”, không lấp bằng component của profile khác.

## Component intake: map ngược từ app

Mọi file component ở AISEE Core có owner, layer và target trong `src/component-intake.manifest.json`. Component có khả năng tái sử dụng nhận thêm mapping:

- `composition`: app đang compose component DS đúng cách;
- `candidate`: pattern có thể được nâng lên DS sau review;
- `replace`: local component nên được thay bằng component DS.

Status:

- `linked`: đã nối và dùng đúng contract;
- `proposed`: đang đề xuất;
- `review`: cần quyết định/migration.

### Quy trình khi app phát sinh component

1. Tạo local component ở feature/app để giải nhu cầu thật.
2. Khai báo origin: owner, layer, target.
3. Sau khi pattern xuất hiện lặp lại, so sánh purpose/anatomy/state.
4. Nếu chỉ là composition, map vào base/application hiện có.
5. Nếu là primitive mới, thêm `candidate` và review accessibility + API.
6. Nếu DS đã có contract tương đương, đánh `replace` và migrate.
7. Khi promote: đưa code, CSS, specimen, export và tài liệu vào repo DS.
8. Đổi status thành `linked`; xóa implementation trùng trong app.

Không promote component chỉ vì “trông có thể dùng lại”. Cần ít nhất một contract ổn định và bằng chứng tái sử dụng.

## Khi nào tách component

Nên tách khi:

- behavior được lặp lại;
- state model độc lập;
- anatomy có tên và responsibility rõ;
- cần QA/accessibility riêng;
- nhiều screen cùng phụ thuộc.

Không nên tách khi:

- chỉ để giảm vài dòng JSX;
- component không có nghĩa ngoài một screen;
- API phải nhận quá nhiều prop xuyên suốt;
- hai trường hợp chỉ giống bề ngoài nhưng khác hành vi/category.

## Anti-pattern đã rút ra

- **Over-design bằng chữ:** thêm subtitle, eyebrow và mô tả thay vì sửa hierarchy.
- **Một skin cho mọi app:** đổi palette nhưng giữ nguyên application component dù category khác.
- **Hardcode token:** hex và spacing rải trong CSS làm profile không thể thay.
- **Variant explosion:** boolean chồng chéo tạo tổ hợp không kiểm soát.
- **Local primitive:** mỗi feature tự dựng button/menu/modal riêng.
- **Fake state:** specimen chỉ đổi màu để giả hover/focus nhưng production behavior không tồn tại.
- **Dialog thiếu focus contract:** nhìn đúng nhưng keyboard mắc kẹt hoặc focus mất sau khi đóng.
- **Hover-only action:** desktop thấy được, touch không có đường thao tác.
- **Generated file hand edit:** sửa output thay vì sửa config/engine, lần build sau bị mất.

## Definition of done

Một component chỉ hoàn tất khi:

- purpose và layer rõ;
- API typed và không có variant mơ hồ;
- dùng semantic token;
- đủ state;
- keyboard và screen reader đúng;
- light/dark hoạt động;
- responsive và hover-none được kiểm tra;
- reduced motion tồn tại nếu có animation;
- có specimen tĩnh để review toàn state;
- có mapping nguồn nếu phát sinh từ app;
- không tạo implementation trùng trong AISEE Core.

## Mẫu review ngắn

```text
Tên:
Layer:
Owner:
Purpose:
Anatomy:
Variants:
States:
Keyboard:
Tokens:
Responsive:
Profile differences:
Source mapping:
Decision: local / compose / candidate / replace / linked
```
