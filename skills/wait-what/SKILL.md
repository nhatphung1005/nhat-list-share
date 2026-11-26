---
name: wait-what
description: "Dừng. Câu trả lời vừa rồi người dùng chưa hiểu: nói lại cho dễ hiểu. Gọi tay bằng /wait-what [chỗ chưa hiểu]."
argument-hint: "[chỗ chưa hiểu]"
disable-model-invocation: true
---

Port từ `mattpocock/skills` (`skills/productivity/wait-what`).

người dùng chưa hiểu tin nhắn vừa rồi của bạn, hoặc không biết bạn đang ở bước nào. Nói lại (re-pitch), không làm thêm việc gì:

1. **Bối cảnh trước** — 1–2 câu: đang làm việc gì, tới bước nào, vì sao có tin nhắn đó.
2. **Rồi mới tới ý chính** — điều người dùng cần biết hoặc cần quyết, nói thẳng.
3. **Tiếng Việt đơn giản** (tinh thần ASD-STE100): câu ngắn, mỗi câu một ý, chủ động, không ẩn dụ,
   không viết tắt lạ. Từ tiếng Anh/thuật ngữ bắt buộc phải dùng ⇒ giải thích bằng một câu ngay lần đầu.
4. **Dùng đúng từ của người dùng và của dự án** — từ người dùng đã dùng trong phiên; bảng "Từ điển riêng của người dùng" trong
   skill `human-sound`; `GLOSSARY.md` của repo nếu có. Không đổi tên gọi giữa chừng.
5. **Ví dụ cụ thể** khi ý còn trừu tượng (một lệnh, một file, một tình huống thật trong dự án).
6. Có tham số ⇒ chỉ giải thích lại đúng chỗ đó.

Ngắn hơn tin nhắn gốc. Kết thúc bằng câu hỏi người dùng cần trả lời (nếu có), không thêm đề xuất mới.
