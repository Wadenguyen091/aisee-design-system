# AISEE Design Knowledge

Bộ kiến thức này là phần nền để AISEE và các Mini App dùng chung. Nó tách rõ ba câu hỏi:

1. [Nguyên tắc thiết kế](./01-DESIGN-PRINCIPLES.md) — vì sao giao diện được quyết định như vậy.
2. [Color engine và quy tắc đặt variable](./02-COLOR-ENGINE-AND-VARIABLES.md) — màu được sinh, kiểm tra, đặt tên và đưa vào app như thế nào.
3. [Kinh nghiệm dựng component](./03-COMPONENT-BUILDING-GUIDE.md) — cách biến nhu cầu sản phẩm thành component bền, có thể tái sử dụng và map ngược vào Design System.

## Cách dùng

- Người thiết kế: đọc theo thứ tự 1 → 2 → 3.
- Lập trình viên: bắt đầu từ tài liệu 3, sau đó tra token trong tài liệu 2.
- AI agent: coi ba tài liệu là constraint. Không tự tạo visual language, token hay interaction contract mới nếu hệ thống đã có.
- Mini App: kế thừa nguyên tắc và semantic contract; chỉ phân hóa profile, category và application component của chính app.

## Source of truth

| Lớp | Nguồn chuẩn |
|---|---|
| Nguyên tắc | `AISEE_DESIGN_KNOWLEDGE.md`, `docs/01-*` |
| Primitive và semantic contract | `src/tokens.css` |
| Theme đã build | `src/theme.css` |
| Token cho máy đọc | `src/tokens.manifest.json` |
| Base component | `src/base/` |
| Application component | `src/application/` |
| Nguồn gốc và mapping component | `src/component-intake.manifest.json` |
| Thuật toán Pallet | AISEE Core `src/pallet/engine.ts` |
| Build theme | AISEE Core `src/pallet/themeExport.ts` |

Không sửa tay `src/theme.css`. Màu production phải đi qua Pallet và bước build theme.
