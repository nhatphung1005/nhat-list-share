---
name: mr-chi-tiet
description: Mỗi lần push + tạo MR trên GitLab (gitlab.example.com), soạn description MR chi tiết theo khuôn MR mẫu kèm tóm ticket Jira, rồi tự điền vào MR qua API (biến GITLAB_TOKEN). Dùng khi người dùng bảo push/tạo MR, ở Bước 4 của commander, hoặc gọi /mr-chi-tiet TICKET-xxx.
argument-hint: "[TICKET-xxx] [repo/worktree]"
---

# MR chi tiết — description đầy đủ tự vào MR

người dùng duyệt 23/11/2026: khuôn **MR mẫu** + mục **tóm ticket Jira**, điền tự động bằng **token GitLab**.
Luật trên skill này vẫn đứng trên nó: commit/push xin người dùng **từng lần**; Claude **không bao giờ merge**
(hook `block-dangerous-git.js` chặn); gán reviewer; không push thẳng nhánh sprint.

## 1. Soạn description

Ghi vào `<workspace>/mr/MR-<TICKET>.md` dưới mục `## ▼ Description`, đồng thời lưu phần description ra file riêng
`<workspace>/mr/desc-<TICKET>-<repo-ngắn>.md` (mỗi repo một file, vd `desc-TICKET-663-api.md`) — file này là cái
script đẩy lên GitLab. Mẫu tham chiếu: `<workspace>/mr/MR-mau.md`. Tiếng Việt đơn giản. Thứ tự mục:

1. Dòng mở: **[Màn/khu vực] thay đổi gì**. Rồi `Tác nhân: …`, `Jira: <link>`, `Liên quan: <ticket + người làm>`.
2. **Ticket Jira** (mới, người dùng 23/11): lấy bằng `getJiraIssue` (view "evidence") — tiêu đề, mô tả tóm gọn (giữ ý,
   không chép cả trang), **tiêu chí chấp nhận nguyên văn** dạng checklist, ticket cha/epic. Không bịa phần ticket
   không có; ticket trống mô tả ⇒ ghi "Ticket không có mô tả".
3. **Vấn đề**: hiện đang chạy thế nào, bảng nhỏ nếu có nhiều lớp/nguồn; triệu chứng cụ thể người dùng thấy.
4. **Phạm vi**: repo nào, đụng gì. Cố ý **KHÔNG** đổi gì (BE/API/DTO/DB/event, logic để nguyên, đồ cũ chưa dọn) và vì sao.
5. **Hành vi sau MR**: người dùng thấy gì, ca biên, dữ liệu không nằm trong phạm vi thì sao.
6. **Đã thay đổi gì**: bảng file → thay đổi; tổng số file, +/− dòng, SHA commit, SHA nhánh nền, có xung đột không
   (số lấy từ `git diff --stat` thật, không ước).
7. Bảng nghiệp vụ nếu giúp reviewer đối chiếu (bảng dịch, trạng thái/mã HTTP, trước/sau).
8. **Lưu ý cho reviewer**: giới hạn, đánh đổi thiết kế, nợ còn lại, đề xuất ticket con (không tự tạo).
9. **Tiêu chí nghiệm thu**: môi trường, tài khoản, chế độ; mỗi case đã kiểm kèm kết quả thật (từ mục 5 file phối hợp,
   cột Claude kiểm chứng), ảnh nằm trên Jira, đối chiếu DB, số unit test + build thật.
10. **Chưa test được**: từng mục, lý do, sẽ kiểm ở đâu.
11. **Cách tester kiểm (trên dev sau deploy)**: các bước bấm, đánh số.
12. Cuối: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

Chỉ ghi kết quả đã chạy thật. Không mật khẩu, token, dữ liệu cá nhân trong description.
Đưa người dùng duyệt description cùng lúc xin phép commit/push (Bước 4.1 của `commander`).

## 2. Push + tạo MR (sau khi người dùng duyệt)

Trong worktree của ticket, mỗi repo một lần:

```bash
git push -u origin <nhánh-feature> -o merge_request.create -o merge_request.target=<sprint_N> -o "merge_request.title=<tiêu đề>" -o merge_request.assign=<username reviewer>
```

Chưa biết username GitLab của reviewer ⇒ bỏ `assign`, nhắc người dùng gán trên web (không đoán từ email). Push option không
chứa được nhiều dòng (git cấm xuống dòng) ⇒ description điền ở bước 3, không qua `-o merge_request.description`.

## 3. Điền description vào MR

```bash
node "<thư mục skill này>/scripts/set-mr-description.js" <repo-hoặc-worktree> <nhánh-feature> <workspace>/mr/desc-<TICKET>-<repo>.md --dry-run
node "<thư mục skill này>/scripts/set-mr-description.js" <repo-hoặc-worktree> <nhánh-feature> <workspace>/mr/desc-<TICKET>-<repo>.md
```

(`<thư mục skill này>` = `${CLAUDE_PLUGIN_ROOT}/skills/mr-chi-tiet`; máy người dùng: `<thư mục plugin>/skills/mr-chi-tiet`.)
Script tìm đúng **một** MR đang mở từ nhánh đó, PUT description, đọc lại để so khớp. Chạy `--dry-run` trước để chắc
đúng MR. Script từ chối file quá ngắn (< 200 ký tự) để không đè description bằng file rỗng. Nó không merge, không
đổi gì khác của MR.

Lỗi thường gặp:
- `GITLAB_TOKEN is not set` ⇒ dừng, nhắc người dùng cài token (mục dưới). Không hỏi người dùng gửi token vào chat.
- `HTTP 401/403` ⇒ token sai/hết hạn/thiếu quyền `api` ⇒ báo người dùng.
- `found 0` ⇒ push chưa tạo MR (thiếu `-o merge_request.create`) hoặc MR đã đóng; `found 2+` ⇒ báo người dùng, không tự chọn.

Xong ⇒ ghi link MR + "description đã điền" vào `MR-<TICKET>.md`, file phối hợp, và comment Jira (Bước 4.3 commander).

## Cài token (người dùng tự làm một lần)

Claude không tạo token, không gõ token, không đọc giá trị token. người dùng:
1. Vào `https://gitlab.example.com/-/user_settings/personal_access_tokens` → tạo token, quyền **api**, đặt hạn.
2. Trong PowerShell của người dùng: `setx GITLAB_TOKEN "<token>"`, rồi mở lại Claude để phiên mới nhận biến.
Kiểm (không lộ giá trị): `node -e "console.log(process.env.GITLAB_TOKEN ? 'GITLAB_TOKEN có' : 'GITLAB_TOKEN chưa có')"`.
