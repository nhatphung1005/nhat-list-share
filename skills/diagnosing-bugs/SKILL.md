---
name: diagnosing-bugs
description: Vòng chẩn đoán cho bug khó và chậm/hiệu năng tụt. Dùng khi người dùng nói "debug", "chẩn đoán", "tìm nguyên nhân", hoặc báo cái gì đó hỏng / lỗi / ném exception / test fail / chậm.
---

# Chẩn đoán bug

Port từ `mattpocock/skills` (`skills/engineering/diagnosing-bugs`). Viết tiếng Việt, đơn giản.
Bỏ pha nào thì phải nói rõ lý do.

Khi đọc code: đọc `GLOSSARY.md` nếu có, và ADR của vùng đang đụng tới.

## Che bí mật

Skill này bắt in lệnh, output, artifact ⇒ **che mọi bí mật trước**: viết `<REDACTED>`. Dựng vòng lặp dùng biến
môi trường để mật khẩu/token nằm trong môi trường, không nằm trong cái in ra. Request bắt được có header auth:
chỉ trích dòng mang tín hiệu. Không chép mật khẩu test ra.
Output đã che không đủ để chẩn đoán ⇒ nói rõ và hỏi người dùng.

## Pha 1: Dựng vòng lặp phản hồi

**Đây là cả skill.** Có tín hiệu đỏ/xanh **chặt** cho đúng bug này thì sẽ tìm ra nguyên nhân; bisect, thử giả
thuyết, gắn log chỉ là dùng tín hiệu đó. Không có thì nhìn code bao lâu cũng vô ích.
Dồn công vào đây. Mạnh tay, sáng tạo, không bỏ cuộc.

### Cách dựng, theo thứ tự ưu tiên

1. **Test fail** ở đường nối chạm tới bug: unit / integration (`dotnet test --filter <Tên>`), FE (`ng test`).
2. **curl / script HTTP** gọi service đang chạy (vd API gateway, service backend).
3. **Chạy CLI** với input cố định, so stdout với bản đúng đã biết.
4. **Script trình duyệt** bấm UI và kiểm DOM/console/network: Selenium (`scripts\bo-test\`) cho local;
   trình duyệt có sẵn trong app (`mcp__Claude_Browser__*`) cho dev GIS.
5. **Phát lại dấu vết đã bắt**: lưu request/payload/event thật ra đĩa, đẩy lại qua đường code đó một mình.
6. **Khung chạy tạm**: dựng phần nhỏ nhất của hệ thống (một service, phụ thuộc giả) chạy đúng đường code lỗi.
7. **Vòng ngẫu nhiên / fuzz**: bug kiểu "thỉnh thoảng sai" ⇒ chạy 1000 input ngẫu nhiên tìm kiểu lỗi.
8. **Khung bisect**: bug xuất hiện giữa hai trạng thái đã biết (commit, dữ liệu, phiên bản) ⇒ tự động hoá
   "dựng ở X, kiểm, lặp" để `git bisect run`.
9. **So sánh hai bản**: cùng input qua bản cũ và bản mới (hoặc hai cấu hình), diff output.
10. **Script có người tham gia (HITL)**: cách cuối cùng. Phải có người bấm ⇒ dùng `scripts/hitl-loop.template.sh`
    để vòng lặp vẫn có cấu trúc. Script dùng `read` nên chạy trong Terminal panel (`run_in_terminal`), người dùng làm theo
    nhắc trên terminal; Claude đọc kết quả `KEY=VALUE` bằng `read_terminal`. Đăng nhập luôn là `step` cho người dùng làm.

### Siết vòng lặp

- Nhanh hơn được không? (cache bước dựng, bỏ khởi tạo không liên quan, thu hẹp phạm vi test)
- Tín hiệu sắc hơn được không? (kiểm đúng triệu chứng, không phải "không crash")
- Ổn định hơn được không? (cố định thời gian, seed ngẫu nhiên, cô lập file, chặn mạng)

Vòng 30 giây chập chờn gần như vô dụng; vòng 2 giây ổn định là vũ khí.

### Bug lúc có lúc không

Mục tiêu không phải tái hiện sạch mà là **tăng tỉ lệ tái hiện**: lặp 100 lần, chạy song song, thêm tải, thu hẹp
cửa sổ thời gian, chèn sleep. 50% còn debug được; 1% thì chưa — tiếp tục nâng tỉ lệ.
(Vd hàng đợi bị máy khác giành lệnh: poll 1s, đếm số lần bị bỏ qua.)

### Thật sự không dựng được vòng lặp

Dừng, nói rõ, liệt kê đã thử gì. Xin người dùng: (a) quyền vào môi trường tái hiện được, (b) artifact đã che
(HAR, log, ảnh/quay màn hình có giờ), hoặc (c) cho phép gắn log tạm trên môi trường đó.
**Không** đoán nguyên nhân khi chưa có vòng lặp.

### Điều kiện xong: một lệnh chặt và đỏ được

Xong pha 1 khi gọi tên được **một lệnh** (đường dẫn script, lệnh test, curl) **đã chạy ít nhất một lần**
(in lệnh và output, đã che), và lệnh đó:

- [ ] **Đỏ được**: đi đúng đường code lỗi, kiểm **đúng triệu chứng người dùng báo**; đỏ khi có bug, xanh khi đã sửa.
- [ ] **Ổn định**: chạy lần nào cũng cùng kết quả (bug chập chờn: tỉ lệ tái hiện cao, cố định).
- [ ] **Nhanh**: vài giây, không phải vài phút.
- [ ] **Claude tự chạy được**: không cần người, trừ khi qua `hitl-loop`.

Thấy mình đang đọc code để dựng giả thuyết mà chưa có lệnh này ⇒ **dừng lại**: nhảy thẳng vào giả thuyết chính
là lỗi skill này ngăn. Chưa có lệnh đỏ được thì chưa sang pha 2.

## Pha 2: Tái hiện + thu nhỏ

Chạy vòng lặp, thấy nó đỏ. Xác nhận:

- [ ] Lỗi ra đúng kiểu **người dùng mô tả**, không phải một lỗi khác gần đó. Sai bug = sửa sai.
- [ ] Tái hiện được qua nhiều lần chạy (bug chập chờn: tỉ lệ đủ cao).
- [ ] Đã ghi đúng triệu chứng (thông báo lỗi, output sai, thời gian chậm) để sau kiểm bản sửa.

### Thu nhỏ

Đỏ rồi thì cắt kịch bản xuống **nhỏ nhất vẫn còn đỏ**: bớt input, caller, cấu hình, dữ liệu, bước — **từng thứ
một**, chạy lại vòng lặp sau mỗi lần cắt, chỉ giữ thứ gây lỗi. Repro nhỏ thu hẹp chỗ nghi ở pha 3 và thành test
hồi quy sạch ở pha 5. Xong khi **mọi thứ còn lại đều cần**: bỏ bất kỳ thứ nào là xanh.

Chưa tái hiện **và** thu nhỏ thì chưa đi tiếp.

### Gom manh mối trước khi đoán

Chỉ đọc, làm được trước CỔNG 1. Kết quả là đầu vào cho giả thuyết ở pha 3.

- **Thay đổi gần đây**: `git log --oneline -10`, `git diff`, `git log -p --follow <file>`; cả thư viện, cấu hình,
  migration mới. Biết mốc còn chạy đúng ⇒ bisect (pha 1, cách 8).
- **Code tương tự đang chạy đúng**: tìm trong cùng repo/service, **đọc hết**, liệt kê mọi khác biệt với chỗ lỗi,
  kể cả khác biệt nhỏ. Không có code tương tự ⇒ ghi rõ, đi tiếp.

## Pha 3: Đặt giả thuyết

Viết **3–5 giả thuyết xếp hạng** trước khi thử cái nào. Một giả thuyết thì dễ bám chặt vào ý đầu tiên.
Mỗi giả thuyết phải **bác bỏ được**, nêu dự đoán:

> "Nếu <X> là nguyên nhân thì <đổi Y> sẽ làm bug mất / <đổi Z> sẽ làm nặng hơn."

Không nêu được dự đoán ⇒ đó là cảm giác: bỏ hoặc làm rõ.

**Cho người dùng xem danh sách trước khi thử.** người dùng hay biết chuyện xếp hạng lại ngay ("đồng nghiệp vừa sửa chỗ #3"), hoặc
đã loại trừ cái nào. Không chờ nếu người dùng vắng: cứ thử theo thứ hạng của mình.

## Pha 4: Gắn đo đạc (sau khi kế hoạch được duyệt)

Mỗi lần đo phải ứng với một dự đoán ở pha 3. **Đổi một biến mỗi lần.**

1. **Debugger** (breakpoint trong VS/Rider, `dotnet` debug) nếu được. Một breakpoint hơn mười dòng log.
2. **Log đúng chỗ** ở ranh giới phân biệt các giả thuyết.
3. Không bao giờ "log hết rồi grep".

**Gắn tiền tố riêng cho mọi log debug**, vd `[DEBUG-a4f2]`. Dọn cuối bằng một lần grep.

**Lỗi đi qua nhiều tầng** (vd FE → Gateway → service → DB): lần ngược giá trị sai, đừng sửa ở chỗ nó lộ ra.

1. Ở mỗi ranh giới, đối chiếu **dữ liệu vào, dữ liệu ra, cấu hình/biến môi trường** của tầng đó (đã che bí mật).
2. Tìm **tầng đầu tiên sai**: vào đúng mà ra sai. Chỉ đào tiếp tầng đó.
3. Trong tầng đó, hỏi "ai truyền giá trị sai này?", lần ngược caller tới **nơi sinh ra** nó. Sửa ở nơi đó.

Xem log sẵn có, tab Network, request/response đã bắt thì làm được trước CỔNG 1; **thêm log mới thì sau CỔNG 1**.

**Nhánh hiệu năng**: log thường sai cách. Đo nền trước (đo thời gian, profiler, `EXPLAIN ANALYZE` cho query
Postgres), rồi bisect. Đo trước, sửa sau.

## Pha 5: Sửa + test hồi quy (sau khi kế hoạch được duyệt)

Viết test hồi quy **trước khi sửa**, nhưng chỉ khi có **đường nối đúng** — test chạy đúng kiểu lỗi như ở chỗ gọi thật.
Đường nối quá nông (test một caller khi bug cần nhiều caller, unit test không dựng lại được chuỗi gây lỗi) thì
test ở đó cho niềm tin giả. **Không có đường nối đúng thì đó chính là phát hiện**: ghi lại, kiến trúc đang cản việc
khoá bug này.

Có đường nối đúng:
1. Biến repro đã thu nhỏ thành test fail ở đường nối đó.
2. Thấy nó fail. Nếu ép đỏ bằng cách sửa code/fixture ⇒ `diff` với bản sạch để chắc thay đổi đã có hiệu lực.
3. Sửa.
4. Thấy nó pass.
5. Chạy lại vòng lặp pha 1 với kịch bản gốc (chưa thu nhỏ).
6. Chạy **cả bộ test** của service/FE đã sửa (`dotnet test`, `ng test`). Có test đỏ ⇒ kiểm nó đã đỏ từ trước
   khi sửa chưa, báo rõ từng cái; không chạy được thì nói lý do.

### Luật 3 lần

Một lần sửa tính là hỏng khi sửa xong mà vòng lặp pha 1 vẫn đỏ, hoặc sinh lỗi mới ở chỗ khác.

- Hỏng lần 1–2: **gỡ bản sửa hỏng** (chỉ thay đổi của chính lần đó), không chồng thêm, quay lại pha 3 với điều vừa biết.
- Hỏng lần 3: **dừng, không thử lần 4**. Xem lại kiến trúc (mỗi lần sửa lộ thêm ràng buộc ở chỗ khác? phải
  refactor lớn mới sửa được?), báo người dùng: đã thử gì, kết quả từng lần, hướng đề xuất. Chờ người dùng quyết.

## Pha 6: Dọn dẹp

Bắt buộc trước khi nói xong:

- [ ] Repro gốc không còn tái hiện (chạy lại vòng lặp pha 1)
- [ ] Test hồi quy pass (hoặc đã ghi lý do không có đường nối)
- [ ] Cả bộ test đã chạy, test đỏ (nếu có) đã báo rõ
- [ ] Đã xoá hết log `[DEBUG-...]` (`grep` tiền tố)
- [ ] Đã xoá prototype tạm (hoặc chuyển vào chỗ debug có đánh dấu rõ)
- [ ] Giả thuyết đúng được ghi vào commit / mô tả MR / file phối hợp, để người debug sau học được
