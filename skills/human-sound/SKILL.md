---
name: human-sound
description: Trước khi làm bất kỳ lệnh nào người dùng gõ hoặc đọc bằng giọng nói (voice → text), nói lại yêu cầu đó bằng chính lời của người dùng ("my own words") để chắc Claude hiểu đúng rồi mới làm. Dùng cho mọi lệnh/yêu cầu làm việc, nhất là câu dài, câu lộn xộn, có lỗi chính tả hoặc lỗi nhận giọng; gọi tay bằng /human-sound. Không dùng cho câu trả lời ngắn kiểu "ok", "duyệt", chọn nút.
argument-hint: "[lệnh hoặc đoạn voice]"
---

# Human sound — nói lại bằng lời của người dùng trước khi làm

Dựa trên pstack của Lauren Tan (`poteto/plugins/pstack`): `interrogate` bước 2 "State the Intent",
`poteto-mode/references/plan.md` bước 2 "Scope and constraints", và `principle-never-block-on-the-human`.
pstack nêu ý định để reviewer bám vào; skill này nêu ý định **cho chính người dùng đọc lại**, bằng giọng của người dùng.

## Khi nào chạy

- Mọi lệnh làm việc (sửa, tạo, chạy, test, đổi, xoá, gửi…), gõ tay hay đọc voice.
- **Bỏ qua** khi tin nhắn chỉ là: "ok", "duyệt", "làm đi", bấm nút, trả lời một câu Claude vừa hỏi, hoặc câu hỏi một nghĩa ("file X ở đâu").

## Bước 1 — Làm sạch đầu vào (nhất là voice)

Voice và gõ nhanh hay sai chữ. Sửa trong đầu trước khi hiểu:
- Từ kỹ thuật bị nghe/gõ sai ⇒ đoán từ đúng theo ngữ cảnh dự án (vd "selenumum" → Selenium, "ksill" → skill,
  "promt" → prompt, "reccord" → record, "jira tát" → jira-task). Đọc tên file, skill, ticket có thật để đối chiếu.
- Câu lặp, ngắt quãng, "à, ờ", tự sửa giữa câu ("không, ý là…") ⇒ lấy ý **sau cùng**.
- Số ticket, tên người, đường dẫn: không đoán bừa. Không chắc ⇒ đưa vào mục "Chưa chắc".

## Bước 2 — Nói lại bằng lời của người dùng

In ra **đầu** câu trả lời, trước mọi tool call có ghi/sửa/chạy:

```
🗣️ Ý bạn là: <1–3 câu, ngôi "tôi muốn…", giọng của người dùng: tiếng Việt, câu ngắn, từ người dùng hay dùng, không văn vẻ>
- Làm: <các việc cụ thể, đúng phạm vi>
- Không làm: <cái dễ hiểu nhầm là có, nhưng người dùng không nói>
- Tôi sửa chữ: <"từ nghe/gõ" → "từ hiểu"> (chỉ khi có sửa)
- Chưa chắc: <điểm mơ hồ + 2–3 cách hiểu> (chỉ khi có)
```

Luật viết:
- Dùng **từ của người dùng**, không dịch sang thuật ngữ khác. người dùng nói "kéo sang In Review" thì giữ nguyên, không viết "transition".
- Nói lại ý, không chép lại câu. Chép nguyên văn = chưa chứng minh là hiểu.
- Không thêm việc người dùng không nói. Thấy việc nên làm thêm ⇒ ghi riêng là đề xuất, không nhét vào "Làm".
- Không giải thích dài, không khen câu hỏi.

## Bước 3 — Quyết định làm hay hỏi

Theo `never-block-on-the-human`: chỉ dừng khi thật sự cần.

| Tình huống | Làm gì |
|---|---|
| Rõ ý, việc đảo ngược được (sửa file local, đọc, chạy test) | In khối "Ý bạn là" rồi **làm luôn**. người dùng đọc thấy sai thì chặn |
| Có mục "Chưa chắc" làm đổi kết quả | Hỏi (AskUserQuestion, có sẵn 2–3 lựa chọn), chưa làm |
| Việc khó đảo ngược (commit, push, MR, xoá, ghi DB chung, gửi tin, đổi Jira) | In khối "Ý bạn là" và **chờ người dùng xác nhận**, kể cả khi rõ ý |

Luật của project vẫn đứng trên skill này (vd CLAUDE.md, `commander`, luật xin phép commit/push).

## Bước 4 — Học từ chỗ sai

người dùng sửa lại cách hiểu ("không, ý tôi là…") ⇒ làm theo ý mới. Lỗi nghe/gõ lặp lại hoặc từ riêng của người dùng
(vd "tiến độ" = file theo dõi tiến độ) ⇒ ghi vào bảng dưới để lần sau hiểu ngay.

## Từ điển riêng của người dùng (thêm dòng khi gặp)

| người dùng nói / voice ra | Nghĩa là |
|---|---|
| selenumum, selenium | Selenium (tester script Python) |
| ksill, skil | skill |
