---
name: review-2-truc
description: "Review phần code đã đổi từ một mốc (commit, nhánh, tag, merge-base) theo 2 trục tách riêng: Standards (có theo chuẩn đã ghi của repo không) và Spec (có làm đúng ticket/kế hoạch không). Hai subagent chạy song song, báo cáo để cạnh nhau. Dùng khi người dùng muốn review nhánh, MR, code đang làm dở, \"review từ X\", hoặc ở CỔNG 2 của commander."
argument-hint: "[mốc so sánh, vd origin/sprint_10] [mã ticket hoặc đường dẫn spec]"
---

# Review 2 trục: Standards · Spec

Port từ `mattpocock/skills` (`skills/engineering/code-review`), đổi tên để không đè lệnh `/code-review` có sẵn
của Claude Code (lệnh đó tìm bug; skill này kiểm chuẩn + đúng việc). Viết tiếng Việt, đơn giản.

Review diff giữa `HEAD` và một mốc người dùng đưa:
- **Standards**: code có theo chuẩn đã ghi của repo không?
- **Spec**: code có làm đúng ticket / kế hoạch đã duyệt không?

Hai trục chạy bằng **hai subagent song song**, mỗi cái ngữ cảnh mới, để không ảnh hưởng nhau; skill này gom kết quả.
Model subagent: **opus** (luật CỔNG 2 của người dùng; không dùng sonnet/haiku để review). Subagent chỉ đọc: không sửa code,
không commit/push, không đổi Jira.

## 1. Chốt mốc

Lấy mốc người dùng nói (SHA, nhánh, tag, `origin/sprint_10`, `HEAD~5`…). Không nói ⇒ ticket dự án dùng nhánh sprint mà
nhánh feature tách ra (`git branch -r` tìm `origin/sprint_<số>` mới nhất, khớp sprint trên Jira); chỗ khác ⇒ hỏi.

Chạy trong đúng repo/worktree (vd `git -C <workspace>/_wt/svc-123 …`):
- `git rev-parse <mốc>` phải ra SHA.
- `git diff <mốc>...HEAD` (ba chấm, so với merge-base) không rỗng. Có thay đổi chưa commit ⇒ thêm `git diff` và nói rõ.
- `git log <mốc>..HEAD --oneline`.

Ref sai / diff rỗng ⇒ dừng ở đây, không spawn subagent. Ticket chạm nhiều repo (BE + FE) ⇒ làm từng repo.

## 2. Tìm spec

Theo thứ tự:
1. Mã ticket trong commit/nhánh (`TICKET-xxx`) ⇒ `getJiraIssue` (view "evidence"): mô tả, tiêu chí chấp nhận, comment.
2. **Kế hoạch đã duyệt** `<workspace>/phoi-hop/PHOI-HOP-<TICKET>.md` mục 1 (gồm "Cố ý KHÔNG đổi") và mục 5 case test.
3. Đường dẫn người dùng đưa trong tham số.
4. File spec trong `docs/`, `design/` (prd, srs) khớp tên nhánh/chức năng.
5. Không thấy ⇒ hỏi người dùng. Không có spec ⇒ bỏ subagent Spec, ghi "không có spec".

## 3. Tìm nguồn chuẩn

Mọi file quy định cách viết code:
- `CLAUDE.md` của repo đang review (nếu có), `CODING_STANDARDS.md`, `CONTRIBUTING.md`.
- ADR liên quan và đặc tả service/hợp đồng sự kiện trong thư mục docs của dự án.

Ngoài chuẩn của repo, trục Standards luôn mang **bộ mùi code nền** (Fowler, *Refactoring* ch.3). Hai luật:
- **Repo thắng.** Chuẩn đã ghi của repo luôn thắng; repo cho phép cái mà bộ nền chê ⇒ bỏ mùi đó.
- **Luôn là nhận định.** Mỗi mùi là gợi ý có nhãn ("có thể là Feature Envy"), không bao giờ là vi phạm cứng.
  Bỏ qua cái tool đã tự bắt (build, analyzer, lint).

Mỗi mùi: *là gì* → *sửa sao*:
- **Tên bí ẩn**: tên hàm/biến/kiểu không nói nó làm/chứa gì. → đổi tên; không nghĩ ra tên thật thì thiết kế đang rối.
- **Code lặp**: cùng một khuôn logic ở nhiều hunk/file trong thay đổi. → tách phần chung, gọi từ cả hai.
- **Feature Envy**: hàm thò vào dữ liệu của object khác nhiều hơn của mình. → chuyển hàm sang chỗ dữ liệu đó.
- **Cụm dữ liệu**: vài field/tham số luôn đi cùng nhau (một kiểu muốn ra đời). → gom thành một kiểu.
- **Ám ảnh kiểu nguyên thuỷ**: string/số thay cho khái niệm nghiệp vụ đáng có kiểu riêng (vd magic string thay enum). → cho nó kiểu riêng.
- **Switch lặp**: cùng `switch`/chuỗi `if` trên cùng kiểu xuất hiện nhiều chỗ. → đa hình, hoặc một map dùng chung.
- **Sửa rải rác**: một thay đổi logic buộc sửa lắt nhắt nhiều file. → gom cái thay đổi cùng nhau vào một module.
- **Đổi vì nhiều lý do**: một file bị sửa vì nhiều lý do không liên quan. → tách để mỗi module đổi vì một lý do.
- **Trừu tượng phòng xa**: abstraction/tham số/hook cho nhu cầu spec không có. → xoá, inline lại tới khi có nhu cầu thật.
- **Chuỗi gọi dài**: `a.B().C().D()` mà người gọi không nên phụ thuộc. → giấu đường đi sau một hàm của object đầu.
- **Người trung gian**: lớp/hàm chủ yếu chỉ chuyển tiếp. → bỏ, gọi thẳng đích.
- **Từ chối thừa kế**: lớp con / implementer bỏ qua hoặc override hầu hết cái nó nhận. → bỏ kế thừa, dùng composition.

## 4. Spawn hai subagent song song

Gọi cả hai `Agent` trong **một** message, chạy foreground, `model: opus`, gom báo cáo trả về.

**Prompt subagent Standards** gồm:
- Thư mục repo/worktree, lệnh diff đầy đủ, danh sách commit.
- Danh sách file nguồn chuẩn ở bước 3 và **bộ mùi code nền dán nguyên văn**.
- Đề bài: "Báo theo file/hunk: (a) mọi chỗ diff vi phạm chuẩn đã ghi — dẫn nguồn (file + luật, vd `docs/CLAUDE.md`
  Điều CẤM #21); (b) mùi code nền thấy được — gọi tên và trích hunk. Tách vi phạm cứng với nhận định: vi phạm chuẩn
  đã ghi có thể cứng, mùi nền luôn là nhận định, chuẩn của repo thắng bộ nền. Bỏ cái tool đã bắt. Chỉ đọc, không sửa.
  Tiếng Việt, dưới 400 chữ."

**Prompt subagent Spec** gồm:
- Thư mục repo/worktree, lệnh diff, danh sách commit.
- Nội dung ticket Jira (đã lấy ở bước 2) và đường dẫn `PHOI-HOP-<TICKET>.md`.
- Đề bài: "Báo: (a) yêu cầu ticket/kế hoạch đòi mà diff còn thiếu hoặc làm dở; (b) hành vi trong diff không ai yêu
  cầu (lan phạm vi), kể cả đụng vào mục 'Cố ý KHÔNG đổi'; (c) yêu cầu trông như đã làm nhưng cách làm có vẻ sai.
  Trích câu trong ticket/kế hoạch cho từng điểm. Chỉ đọc, không sửa. Tiếng Việt, dưới 400 chữ."

Không có spec ⇒ bỏ subagent Spec, ghi vào báo cáo cuối.

## 5. Gom

Đưa hai báo cáo dưới hai mục `## Standards` và `## Spec`, nguyên văn hoặc sửa nhẹ. **Không** trộn, không xếp hạng
lại giữa hai trục.

Kết thúc bằng một dòng: tổng số điểm mỗi trục, và lỗi nặng nhất **trong từng trục** (nếu có). Không chọn một
"lỗi nặng nhất" chung cho cả hai.

Kết quả subagent là báo cáo, chưa phải bằng chứng: Claude kiểm lại từng điểm "vi phạm cứng" trên code thật trước khi
ghi vào bảng cổng luật (cột Cổng 2) của file phối hợp. Không tự sửa code ở bước này; sửa theo luật CỔNG 2 của `commander`
(chỉ tự sửa lỗi 1 dòng không đổi hành vi, còn lại báo người dùng).

## Vì sao hai trục

Một thay đổi có thể qua trục này mà trượt trục kia:
- Code theo đúng mọi chuẩn nhưng làm sai việc ⇒ **Standards qua, Spec trượt.**
- Code làm đúng y ticket nhưng phá quy ước dự án ⇒ **Spec qua, Standards trượt.**

Báo riêng để trục này không che trục kia.
