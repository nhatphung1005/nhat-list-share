# nhat-list

Plugin Claude Code gồm các skill, agent và hook dùng hằng ngày: nói lại yêu cầu trước khi làm, bàn giao phiên, chẩn đoán bug, review code 2 trục, soạn MR, thiết kế frontend (impeccable), và hook chặn lệnh git nguy hiểm.

> Đây là bản đã lược thông tin nội bộ. Vài skill còn nhắc tới một quy trình ticket riêng (`commander`, "file phối hợp", "CỔNG 1/2") không có trong repo: bỏ qua hoặc thay bằng quy trình của bạn. Thay `gitlab.example.com`, `<workspace>` bằng giá trị của bạn.

## Cài đặt

```powershell
git clone <url repo này> nhat-list
claude plugin marketplace add ./nhat-list
claude plugin install nhat-list@nhat-list
```

Sau khi cài, skill được gọi bằng `/nhat-list:<tên>` hoặc Claude tự chọn khi việc khớp với mô tả. Agent có tên dạng `nhat-list:<tên agent>`.

## Cấu trúc thư mục

```
.claude-plugin/   khai báo plugin + marketplace
agents/           4 subagent phụ trợ cho impeccable
hooks/            hook chạy tự động (nhắc human-sound, chặn git nguy hiểm)
skills/           8 skill của plugin
```

## `.claude-plugin/`

| File | Làm gì |
|---|---|
| `plugin.json` | Khai báo plugin: tên, phiên bản, mô tả. Trỏ tới thư mục `skills/` và `hooks/hooks.json`. |
| `marketplace.json` | Biến repo thành một "marketplace" cục bộ có đúng một plugin là nhat-list, để lệnh `claude plugin install` dùng được. |

## `skills/`

| Skill | Làm gì | Khi nào dùng |
|---|---|---|
| `human-sound` | Nói lại yêu cầu bằng lời của người dùng trước khi làm, để chắc Claude hiểu đúng. Nhất là các lệnh đọc bằng giọng nói, câu dài hoặc lộn xộn. | Tự động với mọi lệnh làm việc (có hook nhắc). Gọi tay: `/human-sound`. |
| `wait-what` | Dừng lại và giải thích lại câu trả lời vừa rồi cho dễ hiểu hơn. | `/wait-what [chỗ chưa hiểu]` |
| `handoff` | Nén cuộc chat hiện tại thành file bàn giao trong `~/.claude/handoffs/`, để một phiên mới làm tiếp mà không cần đọc lại cả chat. | `/handoff [phiên sau làm gì]` |
| `diagnosing-bugs` | Quy trình chẩn đoán bug khó hoặc lỗi chậm theo từng pha: tái hiện, giả thuyết, đo đạc, sửa, test hồi quy. | Khi nói "debug", "tìm nguyên nhân", hoặc báo lỗi, exception, test fail, chậm. |
| `diagnosing-bugs/scripts/hitl-loop.template.sh` | Mẫu script tái hiện lỗi có người tham gia: Claude chạy script, người dùng làm theo từng bước hiện trên terminal. | Chép ra, sửa các bước, rồi chạy. |
| `grill-with-docs` | Hỏi dồn từng vòng để làm rõ kế hoạch, thiết kế hoặc quyết định cho tới khi hai bên hiểu như nhau. Vừa hỏi vừa ghi thuật ngữ (glossary) và quyết định (ADR). | `/grill-with-docs [chủ đề]` |
| `review-2-truc` | Review code đã đổi từ một mốc theo 2 trục riêng: **Standards** (có theo chuẩn của repo không) và **Spec** (có làm đúng ticket không). Hai subagent chạy song song. | Review nhánh, MR, code dở. |
| `mr-chi-tiet` | Soạn description MR chi tiết theo khuôn MR mẫu, kèm tóm tắt ticket Jira, rồi điền thẳng vào MR trên GitLab. | Khi push và tạo MR, hoặc `/mr-chi-tiet TICKET-xxx`. |
| `mr-chi-tiet/scripts/set-mr-description.js` | Script Node gọi GitLab API để ghi description cho MR đang mở của một nhánh. Đọc token từ biến môi trường `GITLAB_TOKEN` và không bao giờ in token ra. | `node set-mr-description.js <repo> <nhánh> <file.md> [--dry-run]` |
| `impeccable` | Bộ công cụ thiết kế frontend (bên thứ ba, Apache 2.0, v4.8.1): thiết kế mới, chỉnh sửa, critique, audit, polish, animate cho web, dashboard, app iOS/Android, design system. | `/nhat-list:impeccable [lệnh] [đích]` |
| `impeccable/reference/*.md` | Tài liệu cho từng lệnh con của impeccable (audit, polish, typeset, colorize, layout, live...). Skill tự đọc file tương ứng khi chạy lệnh đó. | Không gọi trực tiếp. |
| `impeccable/reference/degraded/` | Bản dự phòng của 4 agent, dùng khi không spawn được subagent. | Không gọi trực tiếp. |
| `impeccable/scripts/` | Launcher (`impeccable`, `impeccable.cmd`) và các script chạy chế độ live trên trình duyệt. File engine `bin/impeccable.exe` không có trong repo. Launcher tự tải lại và kiểm checksum (`engine-checksums.txt`) khi thiếu. | Skill tự gọi. |

## `agents/`

Cả 4 agent đều phục vụ skill `impeccable`, được skill tự spawn.

| Agent | Làm gì |
|---|---|
| `impeccable-asset-producer` | Tạo ảnh/asset sạch, dùng lại được từ bản mock đã duyệt, không tự đổi hướng thiết kế. |
| `impeccable-documenter` | Viết `DESIGN.md` từ sản phẩm đã build xong, lấy token và quy tắc từ code thật chứ không từ ý định. |
| `impeccable-finish-reviewer` | Review bản build cuối so với hướng thiết kế và bản comp đã duyệt, trả về danh sách lỗi cần sửa theo thứ tự ưu tiên. |
| `impeccable-manual-edit-applier` | Áp các chỉnh sửa chữ mà người dùng làm tay trên trình duyệt (chế độ live) vào source code. |

## `hooks/`

| File | Làm gì |
|---|---|
| `hooks.json` | Đăng ký 2 hook. **UserPromptSubmit**: mỗi tin nhắn đều nhắc Claude dùng `human-sound`. **PreToolUse** (Bash/PowerShell): chạy `block-dangerous-git.js` trước mỗi lệnh. |
| `block-dangerous-git.js` | Chặn lệnh git nguy hiểm (exit 2): merge MR, auto-merge, push thẳng vào `sprint_*`/`develop`/`main`/`master`, force-push, `reset --hard`, `clean -f`, `branch -D`, `checkout .`, `restore .`. Push nhánh feature và tạo MR vẫn được. Merge để người dùng tự bấm. |
| `block-dangerous-git.test.js` | Test cho hook trên: các lệnh nào phải bị chặn, lệnh nào phải cho qua. Chạy: `node hooks/block-dangerous-git.test.js`. |

