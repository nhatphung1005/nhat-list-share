---
name: handoff
description: Nén cuộc chat hiện tại thành file bàn giao để một phiên Claude mới làm tiếp. Gọi tay bằng /handoff [phiên sau dùng để làm gì].
argument-hint: "[phiên sau dùng để làm gì]"
disable-model-invocation: true
---

# Handoff — bàn giao cho phiên mới

Port từ `mattpocock/skills` (`skills/productivity/handoff`). Viết tiếng Việt, đơn giản.

## Lưu ở đâu

`~/.claude/handoffs/HANDOFF-<chủ đề>-<yyyy-mm-dd-hhmm>.md`
(chủ đề: mã ticket nếu có, vd `TICKET-663`; không thì vài chữ không dấu). Không lưu vào repo/workspace,
không lưu `%TEMP%` (Windows tự dọn). In đường dẫn đầy đủ cho người dùng ở cuối.

## Nội dung file

1. **Mục tiêu** — người dùng muốn đạt gì, bằng lời của người dùng (1–3 câu).
2. **Đã xong** — việc đã làm, đã kiểm chứng tới đâu (kết quả build/test thật, không nói "xong" khi chưa chạy).
3. **Đang dở** — đang ở bước nào, lệnh/file cuối cùng đụng tới.
4. **Việc tiếp theo** — danh sách bước cụ thể, theo thứ tự.
5. **Quyết định của người dùng** — các câu người dùng đã duyệt/từ chối trong phiên (trích ngắn), để phiên sau không hỏi lại.
6. **Bẫy / lưu ý** — lỗi đã gặp, cách đã thử mà không được.
7. **Trỏ tới** — đường dẫn/URL, **không chép lại nội dung**: file phối hợp, `CLAUDE-TIEN-DO.md`, MR, ADR, Jira, nhánh/worktree, commit.
8. **Skill nên gọi** — skill phiên sau cần chạy bằng Skill tool (vd `commander` cho ticket TICKET, `human-sound`).
9. **Câu mở phiên** — một câu người dùng dán vào phiên mới, vd: `Đọc ~/.claude/handoffs/HANDOFF-TICKET-663-....md rồi làm tiếp.`

## Luật

- Không chép lại nội dung đã có ở file khác (spec, kế hoạch, ADR, ticket, commit, diff) — chỉ ghi đường dẫn.
- Xoá thông tin nhạy cảm: mật khẩu, token, API key, dữ liệu cá nhân.
- Có tham số ⇒ coi là việc phiên sau sẽ làm, chỉ giữ phần liên quan.
