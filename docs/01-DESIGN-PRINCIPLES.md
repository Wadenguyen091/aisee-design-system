# 01 — Nguyên tắc thiết kế AISEE

## Vai trò của AISEE Design System

AISEE Design System không phải một skin và cũng không phải bộ ảnh chụp component. Nó là **base knowledge** gồm nguyên tắc, token, behavior và contract để dựng sản phẩm nhanh hơn.

AISEE Core dùng trực tiếp nền này. Mỗi Mini App kế thừa nền nhưng có profile riêng:

- AISEE: modern, chính xác, thiên về công cụ làm việc.
- MAGASIN: friendly, gần gũi, thiên về nội dung và vận hành.
- VEX: tactical, mật độ cao, thiên về trạng thái và hành động.
- THACO BUS: business, rõ ràng, ổn định.

Profile được phép đổi cách biểu đạt; không được làm hỏng khả năng đọc, accessibility hay interaction contract. Nền trình bày của trang Design System luôn là AISEE. Khi chọn profile khác, chỉ specimen/component bên trong đổi sang profile đó.

## Sáu nguyên tắc cốt lõi

### 1. Rõ hơn trang trí

Mọi chi tiết phải phục vụ một trong bốn việc: định hướng, phân cấp, phản hồi hoặc thao tác. Nếu bỏ một đường viền, nhãn, màu hay hiệu ứng mà người dùng vẫn hiểu đúng thì nên bỏ.

Hệ quả thực hành:

- Một màn hình có một điểm bắt đầu rõ.
- Trạng thái quan trọng nổi hơn chrome.
- Không dùng đoạn mô tả dài để bù cho hierarchy yếu.
- Không thêm card chỉ để “đẹp”; dùng surface khi nó thể hiện cấu trúc thật.

### 2. Semantic trước primitive

Component không hỏi “màu này là mã gì?” mà hỏi “màu này có vai trò gì?”. `text/body`, `surface/raised`, `border/subtle`, `action/primary` có thể đổi giá trị theo theme hoặc profile mà component vẫn đúng nghĩa.

Primitive là nguyên liệu. Semantic token là quyết định. Component chỉ nên chạm primitive khi đang trình bày chính primitive đó.

### 3. Contract trước style

Trước khi chọn màu, xác định:

- component dùng để làm gì;
- anatomy gồm những vùng nào;
- state nào tồn tại;
- keyboard và screen reader hoạt động ra sao;
- kích thước, mật độ và responsive behavior;
- slot nào được phép compose.

Style là lớp biểu đạt cuối. Vì vậy VEX và MAGASIN có thể trông rất khác nhưng vẫn chia sẻ contract tốt ở những primitive phù hợp.

### 4. Một trách nhiệm, một component

Base component giải một hành vi lặp lại: button, field, menu, dialog, sheet. Application component compose nhiều base component thành một pattern có nghĩa trong sản phẩm. Feature và screen giữ nghiệp vụ.

Không đẩy business logic vào base component. Không biến component thành “siêu component” bằng hàng chục boolean không liên quan.

### 5. Full bleed khi cấu trúc cần liền mạch

Menu, navigation, list và table row là các chuỗi liên tục. Hover/selected state nên chạy hết chiều ngang vùng chứa để người dùng đọc đúng một hàng và hit area lớn hơn.

Padding thuộc về nội dung bên trong row, không tạo khe vô nghĩa quanh từng trạng thái. Card chỉ dùng khi nhóm thực sự độc lập với nhóm kế bên.

### 6. Tối ưu cho công việc thật

AISEE ưu tiên tốc độ đọc, tốc độ thao tác và trạng thái rõ hơn hiệu ứng trình diễn:

- density có chủ đích;
- loading không làm layout nhảy;
- lỗi xuất hiện gần nguyên nhân;
- hành động nguy hiểm được phân biệt bằng nghĩa và copy, không chỉ bằng màu;
- responsive là sắp xếp lại ưu tiên, không phải thu nhỏ desktop.

## Hierarchy

Một hierarchy tốt được xây theo thứ tự:

1. **Vị trí và khoảng trống** — nhóm nào thuộc nhau.
2. **Kích thước và trọng lượng chữ** — đâu là tiêu đề, nội dung, metadata.
3. **Surface và border** — đâu là container, đâu là separation.
4. **Màu** — dùng cuối cùng cho action, semantic state và category.

Không dùng quá nhiều màu để cứu hierarchy. Không để tất cả text cùng độ sáng. Metadata phải lùi; hành động chính phải rõ; chrome không cạnh tranh với nội dung.

## Typography

- UI mặc định: **Be Vietnam Pro**.
- Editorial/display khi thật sự cần: **Red Rose**.
- Dữ liệu kỹ thuật, mã và token: mono system stack.
- Type scale chạy từ `12/16` đến `72/80`; chọn cấp theo vai trò, không theo cảm giác từng màn.
- Weight dùng 400, 500, 600, 700. Không tạo weight lẻ chỉ để khớp một mockup.
- Uppercase và tracking rộng dành cho eyebrow/technical label ngắn, không dùng cho paragraph.

## Spacing, geometry và density

Hệ spacing dựa trên nhịp 4px với một số mốc 2px: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128`.

- Khoảng cách trong component phải lấy token.
- Khoảng cách lớn thể hiện đổi section; khoảng cách nhỏ thể hiện quan hệ gần.
- Control height chuẩn: 24, 32, 36, 40, 44, 48.
- Radius AISEE hiện rất tiết chế: phần lớn là 2px; pill chỉ dùng khi bản chất là capsule/tag/toggle.
- Grid và alignment phải thắng việc “căn bằng mắt”.

## Motion

Motion chỉ giải thích thay đổi trạng thái hoặc quan hệ không gian.

- Duration chuẩn: 120ms, 160ms, 240ms.
- Easing chuẩn: `cubic-bezier(.2,.8,.2,1)`.
- Không animate thuộc tính gây layout nếu transform/opacity giải được.
- Luôn có `prefers-reduced-motion`.
- Loading dài phải có trạng thái; không dùng animation để che thời gian chờ không xác định.

## Accessibility là contract

- Text thường đạt tối thiểu 4.5:1.
- Text/semantic pair nên đạt 7:1 khi có thể.
- UI graphic và focus boundary đạt 3:1.
- Không truyền đạt trạng thái chỉ bằng màu.
- Mọi icon button có accessible name.
- Field có label, error liên kết bằng `aria-describedby` và `aria-invalid`.
- Dialog giữ focus bên trong, Esc đóng, đóng xong trả focus về opener.
- Menu hỗ trợ Arrow, Home, End, Escape và không làm phím tắt trang chạy xuyên.
- Touch target và hit area không bị thu nhỏ chỉ vì icon nhỏ.

## Base và biến thể

AISEE là nền về **nguyên tắc và contract**, không bắt mọi app có component giống hệt nhau.

### Luôn dùng chung

- semantic roles;
- accessibility;
- state model;
- keyboard behavior;
- naming logic;
- component intake/governance;
- kiểm tra contrast và quy trình build theme.

### Có thể phân hóa theo profile

- palette và typography profile;
- radius, density, motion trong giới hạn khai báo;
- anatomy khi category sản phẩm khác;
- application component;
- copy, icon family, data visualization và screen template.

Ví dụ: VEX command console không phải bản đổi màu của MAGASIN content card. Chúng là hai application component khác nhau, cùng kế thừa nguyên tắc nền và những base primitive phù hợp.

## Checklist quyết định thiết kế

Trước khi chốt một màn hình:

- Người dùng nhìn 3 giây có biết bắt đầu ở đâu không?
- Bỏ màu đi, hierarchy còn đọc được không?
- Mỗi surface có lý do cấu trúc không?
- Hành động chính có đúng một cấp ưu tiên không?
- State hover/focus/loading/disabled/error/empty đã có chưa?
- Keyboard và reduced motion đã được tính chưa?
- Component mới là base, application, feature hay chỉ là screen composition?
- Nếu đổi profile, phần nào phải đổi và phần nào phải giữ contract?
