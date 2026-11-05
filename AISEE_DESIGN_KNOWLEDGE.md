# AISEE Design Knowledge

## 1. Vai trò

AISEE Design System là **base knowledge** của AISEE và toàn bộ Mini App. Nó không áp một giao diện giống nhau lên mọi sản phẩm; nó giữ các quy tắc nền giống nhau để mỗi sản phẩm có thể tạo một Design Profile riêng mà vẫn cùng ngôn ngữ vận hành.

```text
AISEE Design System
  → semantic tokens
  → accessibility
  → interaction contract
  → layout contract
  → component API
      + Mini App Design Profile
      → màu thương hiệu
      → typography
      → radius
      → density
      → motion
      → component đặc thù đã khai báo
```

### Cấu trúc trình bày chuẩn

Design System chỉ có ba phần điều hướng:

1. **Design Principles** — nguyên tắc và governance của engine.
2. **Tokens** — màu, type, spacing, geometry và motion. Tool pha màu là công cụ tạo token được mở từ phần này.
3. **Components** — một trang component duy nhất, chuyển qua lại giữa **Base**, **Application** và **Màn hình**. Màn hình là reference template được mockup từ Base + Application component của chính AISEE, không phải gallery của Mini App. App mới dùng template này làm điểm khởi đầu rồi áp Design Profile riêng. Chuẩn review là desktop 1440×810 và mobile 430×932.

Không duy trì Archive trong giao diện Design System. Component không còn thuộc contract phải được loại khỏi catalog thay vì tiếp tục trình bày như một thư viện dùng được.

Trang Design Principles phải đọc như một system specification, không phải landing page marketing: có manifesto ngắn, chuỗi contract `Principles → Tokens → Components → Screens`, rule áp dụng/tránh, inheritance matrix và governance.

## 2. Nguyên tắc nền

1. **Rõ hơn trang trí.** Mọi màu, đường viền, khoảng cách và chuyển động phải giải thích được chức năng.
2. **Semantic trước primitive.** Feature dùng token theo vai trò như `surface`, `text`, `action`, `danger`; không dùng màu hex trực tiếp.
3. **Contract trước style.** Mini App có thể đổi diện mạo nhưng không đổi hành vi bàn phím, focus, trạng thái hay API của component nền.
4. **Một trách nhiệm, một component.** Không tạo component song song nếu thư viện đã có component cùng trách nhiệm.
5. **Full-bleed khi có cấu trúc.** Table, list, menu và vùng dữ liệu ưu tiên đường chia và nhịp hàng thay cho card lồng card.
6. **Tối ưu cho công việc.** Mật độ thông tin phải đủ cao nhưng không làm mất khả năng đọc, quét và thao tác.

## 3. Foundations

### Màu

- Theme hỗ trợ `light`, `dark` và preference `system`.
- Màu runtime đi theo chuỗi: `primitive → --vault-* → --ds-color-* → component`.
- Brand action gốc hiện tại là Red 500 `#B30000`.
- Border dùng neutral alpha theo cấp: subtle 6%, component 10%, divider 12%, strong 18%.
- Surface nâng cấp theo từng lớp nhỏ, tránh tương phản nền quá mạnh.
- Trạng thái semantic bắt buộc gồm danger, info, warning và success.
- Chữ trên màu phải chọn foreground theo contrast; trạng thái không được truyền đạt chỉ bằng màu.

### Typography

- UI: `Be Vietnam Pro` với system fallback.
- Editorial: `Red Rose` với serif fallback.
- Mono: system monospace stack.
- Body nhỏ nhất là 12/16; không đặt application text thấp hơn mức này.
- Trọng lượng chuẩn: 400, 500, 600, 700.
- Heading dùng scale có chủ đích; không phóng to chữ chỉ để lấp khoảng trống.

### Spacing và layout

- Lưới chính: 4 px.
- 2 px chỉ dùng cho optical adjustment.
- Scale chuẩn: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128.
- Chọn spacing theo quan hệ: inline, control gap, group, card, section, page.
- Trang phải có hierarchy rõ giữa chrome, workspace, surface, overlay và dialog.

### Geometry

- Base AISEE dùng hình học cứng: radius mặc định 2 px.
- `9999px` dành cho pill, badge hoặc control có lý do hình học rõ ràng.
- Mini App được override radius trong Design Profile, nhưng phải giữ kích thước hit-area và trạng thái focus.
- Control heights chuẩn: 24, 32, 36, 40, 44 và touch 48 px.

### Motion

- Fast 120 ms, normal 160 ms, slow 240 ms.
- Easing chuẩn: `cubic-bezier(.2, .8, .2, 1)`.
- Motion dùng để chỉ trạng thái, quan hệ không gian hoặc tiến trình; không dùng để trang trí liên tục.
- Phải tôn trọng `prefers-reduced-motion` ở ứng dụng tiêu thụ.

## 4. Component contract

### Base components

Base là các khối tái sử dụng không biết business domain:

- actions và controls: button, icon button, toggle, tabs, checkbox, switch;
- inputs: field, search, dropdown, slider, color field, textarea;
- feedback: badge, notice, progress, skeleton, empty state;
- overlays: menu, popover, tooltip, dialog, sheet;
- data display: charts, meters, description list;
- interaction đặc thù: cursor và radial menu.

Mọi base component phải có default, hover, focus, active/selected, disabled và error khi trách nhiệm của nó cần các trạng thái này.

### Application components

Application pattern được ghép từ Base, ví dụ:

- topbar, profile menu, data table và dashboard card;
- search/filter pattern;
- AI session, conversation, gateway và code workspace;
- color workflow và upload;
- map controls, folder, loading và tactical surfaces.

Application component có thể hiểu workflow nhưng không được tự tạo lại primitive hoặc accessibility behavior.

## 5. Accessibility contract

- Tất cả control tương tác phải dùng được bằng bàn phím.
- Focus visible phải rõ, không bị che và không bị xóa chỉ vì thẩm mỹ.
- Icon-only control phải có accessible name.
- Dialog và sheet quản lý focus, Escape và trả focus về trigger.
- Menu, tabs, checkbox, switch và progress phải có semantic/ARIA phù hợp.
- Touch target mục tiêu là 48 px; control desktop không nhỏ hơn scale đã khai báo.
- Contrast phải được kiểm tra ở cả light và dark.
- Loading, empty, error, offline và permission denied là trạng thái thiết kế bắt buộc.

## 6. Design Profile của Mini App

Mỗi Mini App kế thừa Base và khai báo profile, không fork toàn bộ Design System.

| Profile | Tính chất | Ví dụ |
|---|---|---|
| Modern | sáng, chính xác, nội dung là trung tâm | AISEE, SALA GEO |
| Friendly | ấm, gần gũi, phù hợp vận hành hằng ngày | MAGASIN |
| Tactical | tối, compact, ưu tiên tín hiệu và trạng thái | VEX |
| Business | tin cậy, có cấu trúc, phù hợp nội dung doanh nghiệp | THACO Bus |

Profile được phép override:

- brand and accent tokens;
- font UI/display;
- radius;
- density;
- motion timing trong giới hạn accessibility;
- component đặc thù có tên và owner rõ ràng.

Profile không được override:

- keyboard behavior;
- focus contract;
- semantic meaning của status;
- minimum readable text;
- loading/error/empty contracts;
- component API chung nếu chưa nâng version.

## 7. Luồng thiết kế và build

```text
Yêu cầu
  → xác định Project/Mini App
  → đọc Design Profile
  → đọc token manifest
  → tìm component đã có
  → compose UI
  → kiểm tra type + Design System boundary
  → visual audit desktop/mobile
  → preview
  → phê duyệt
```

Một thay đổi UI chưa hoàn tất nếu còn hardcode màu không có lý do, tạo component trùng trách nhiệm, thiếu trạng thái lỗi hoặc chưa kiểm tra keyboard/focus.

### Starter contract cho app mới

App mới không dựng lại foundation. Nó phải bắt đầu bằng package AISEE, sau đó khai báo profile:

```bash
npm install @aisee/design-system
```

```tsx
import { VaultButton } from '@aisee/design-system';
import '@aisee/design-system/styles.css';
```

```ts
export const designProfile = {
  extends: 'aisee',
  profile: 'modern',
  overrides: ['brand', 'typography', 'radius', 'density', 'motion'],
};
```

Mục tiêu là để AI hoặc developer dành thời gian cho business feature. Token, theme, component states, accessibility và interaction đã có sẵn từ engine nền.

## 8. Quy tắc dành cho AI agent

Khi nhận một repository để áp Design System, agent phải:

1. lập inventory của token và component hiện có;
2. ánh xạ primitive cũ sang semantic token AISEE;
3. tái sử dụng component contract trước khi đổi layout;
4. tạo Design Profile riêng thay vì sửa Base để chiều theo một app;
5. báo rõ phần kế thừa, phần override và component mới;
6. không báo hoàn tất khi typecheck, boundary check hoặc build thất bại.

## 9. Source of truth

- `src/tokens.css`: contract token nền.
- `src/theme.css`: giá trị theme được sinh từ Pallet.
- `src/tokens.manifest.json`: manifest để UI và agent đọc bằng máy.
- `src/base`: component nền.
- `src/application`: pattern cấp ứng dụng.
- File này: kiến thức và luật sử dụng cho con người/AI.

Nếu prose và source mâu thuẫn, source đang phát hành là bằng chứng triển khai; mâu thuẫn phải được ghi nhận và sửa bằng một version mới, không tự diễn giải âm thầm.
