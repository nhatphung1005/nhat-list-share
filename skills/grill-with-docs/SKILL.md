---
name: grill-with-docs
description: Hỏi dồn người dùng từng vòng để làm rõ một kế hoạch / thiết kế / quyết định cho tới khi hai bên hiểu như nhau, đồng thời ghi lại thuật ngữ (glossary) và quyết định (ADR) ngay khi chốt. Gọi tay bằng /grill-with-docs [chủ đề].
argument-hint: "[kế hoạch / thiết kế / ticket cần làm rõ]"
disable-model-invocation: true
---

# Grill with docs — hỏi dồn + ghi tài liệu

Port từ `mattpocock/skills`: `engineering/grill-with-docs` = `productivity/grilling` + `engineering/domain-modeling`
(gộp thành một file). Viết tiếng Việt, đơn giản.


## Phần 1 — Hỏi dồn (grilling)

Hỏi người dùng tới khi hai bên hiểu như nhau. Vẽ trong đầu một **cây quyết định**: mỗi quyết định rẽ ra các quyết định
phụ thuộc nó.

Làm theo **vòng**. **Biên** = mọi quyết định mà điều kiện trước đã chốt — những câu hỏi được *ngay bây giờ* mà không
phải đoán câu trả lời chưa nghe. Mỗi vòng hỏi **cả biên**: đánh số, kèm đề xuất trả lời. Rồi chờ người dùng trả lời mới
sang vòng sau.

```
❓ **Q1** - **<tiêu đề câu hỏi>**: <nội dung, có thể nhiều đoạn, có các lựa chọn>

➡️ <đề xuất trả lời> — nguồn: <file + mục/dòng, hoặc "không có nguồn">

---

❓ **Q2** - **<tiêu đề>**: <nội dung>

➡️ <đề xuất> — nguồn: <…>
```

- Viết câu hỏi sao cho trả lời "có" = chấp nhận đề xuất.
- Mỗi vòng người dùng trả lời làm cây đổi: quyết định đã chốt đẩy biên ra xa, mở khoá câu phụ thuộc. Tính lại biên rồi hỏi vòng
  tiếp. Câu nào phụ thuộc một câu khác **còn mở trong vòng này** ⇒ để vòng sau.
- **Tìm sự thật là việc của Claude, không phải của người dùng.** Câu cần một fact từ môi trường (file, code, DB chỉ đọc, Jira)
  ⇒ giao subagent ngữ cảnh mới đi tìm (model theo bảng model của người dùng: tra cứu đơn giản = haiku); không hỏi người dùng cái tự
  tra được. Không chờ: đang tra = điều kiện chưa chốt, chỉ các câu phía sau nó phải đợi; hỏi phần còn lại của biên ngay.
- **Quyết định là của người dùng**: đưa từng cái cho người dùng và chờ.
- Xong khi biên rỗng: mọi nhánh của cây đã đi qua, không còn gì ngầm giả định. **Không hành động** cho tới khi người dùng
  xác nhận đã hiểu như nhau.

## Phần 2 — Mô hình nghiệp vụ (domain-modeling), làm song song trong lúc hỏi

Đây là việc *chủ động*: vặn lại thuật ngữ, bịa tình huống biên, ghi glossary và quyết định ngay khi chúng rõ.

- **Đối chiếu glossary**: người dùng dùng từ trái với nghĩa đã chốt ⇒ nói ngay. "Đã chốt 'hồ sơ' là X, nhưng anh đang dùng
  theo nghĩa Y. Cái nào?" (Nguồn từ: glossary nháp, `design/srs`, `design/prd`, `docs/services`, từ điển riêng trong
  skill `human-sound`.)
- **Làm sắc từ mơ hồ**: từ mơ hồ/đa nghĩa ⇒ đề xuất một từ chuẩn. "'Tài khoản' là user trong app hay user ở hệ thống đăng nhập?
  Hai thứ khác nhau."
- **Bàn tình huống cụ thể**: khi bàn quan hệ nghiệp vụ, thử bằng tình huống biên để buộc ranh giới khái niệm rõ ràng
  (vd user thuộc hai tổ chức, hồ sơ bị trả lại giữa chừng, đổi email khi đang có phiên đăng nhập).
- **Đối chiếu code**: người dùng nói nó chạy thế nào ⇒ kiểm code có đúng vậy không. Lệch ⇒ nêu ra: "Code đang xoá cả X,
  nhưng anh vừa nói chỉ xoá một phần. Cái nào đúng?" (Tài liệu lệch code: tin code, báo lại — `/jira-task` B.6.)
- **Ghi glossary ngay**, không dồn lại, theo khuôn dưới. Glossary **không chứa chi tiết hiện thực**: không phải spec,
  không phải nháp, không phải chỗ ghi quyết định kỹ thuật. Chỉ là bảng thuật ngữ.
- **ADR**: chỉ đề xuất khi đạt tiêu chí `/jira-task` D.1. Kiểm thêm theo Matt: khó đảo ngược + người đọc sau sẽ thắc mắc
  "sao lại làm vậy" + có đánh đổi thật giữa các phương án. Thiếu ⇒ không ADR.

### Khuôn glossary

```md
## Thuật ngữ đã chốt — <ngữ cảnh, vd Quản lý người dùng>

**<Từ chuẩn>**:
<1–2 câu: nó LÀ gì, không phải nó làm gì>
_Tránh_: <các từ khác cùng nghĩa>
```

- **Dứt khoát**: nhiều từ cho một khái niệm ⇒ chọn một, các từ kia ghi ở `_Tránh_`.
- **Định nghĩa gọn**: tối đa 1–2 câu.
- **Chỉ từ riêng của dự án**: khái niệm lập trình chung (timeout, retry, DTO…) không vào glossary.
- Nhiều ngữ cảnh (mỗi service một bộ từ) ⇒ nhóm theo service; quan hệ giữa các service ghi theo `docs/contracts/events.md`.

## Kết thúc

Tóm lại: các quyết định đã chốt (kèm nguồn hoặc "người dùng quyết"), thuật ngữ đã chốt, ADR nháp (nếu có), câu còn mở.
Ghi vào file phối hợp/tóm tắt ở trên và in đường dẫn. Không code, không ghi repo docs ở bước này.
