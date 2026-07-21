# Git & GitHub — cách nó thực sự hoạt động trong dự án thật

Tài liệu này giải thích Git/GitHub **không phải qua lý thuyết chung chung**, mà bám vào chính lịch sử commit thật của repo `mhike` (5 commit, 1 branch `main`, remote SSH tới `github.com/loganlee23011-vn/mhike`) để bạn thấy khái niệm ứng với thao tác cụ thể nào. Phần cuối có so sánh cách bạn đang làm (solo, commit thẳng `main`) với cách 1 team thật sự làm việc trên GitHub.

---

## 1. Git ≠ GitHub — phân biệt trước tiên

| | Git | GitHub |
|---|---|---|
| Là gì | Phần mềm quản lý phiên bản, chạy **local trên máy bạn** | Dịch vụ web **lưu trữ** repo Git + thêm tính năng cộng tác (PR, Issues, Actions...) |
| Chạy ở đâu | Trong thư mục `.git/` ẩn ở gốc project | Trên server của Microsoft (chủ sở hữu GitHub) |
| Cần mạng? | Không — commit, xem log, tạo branch đều làm offline được | Có — push/pull/clone cần kết nối |
| Ví dụ khác | GitLab, Bitbucket cũng dùng Git nhưng khác GitHub | — |

→ Bạn có thể dùng Git mà **không cần GitHub** (commit local thôi). GitHub chỉ là 1 nơi *host* bản sao của repo Git đó để chia sẻ/backup/cộng tác.

📖 https://docs.github.com/en/get-started/using-git/about-git

---

## 2. 4 "vùng" dữ liệu của Git — nền tảng của mọi lệnh

```
┌─────────────────┐   git add    ┌───────────────┐   git commit   ┌────────────────┐   git push   ┌────────────────┐
│ Working Directory│ ───────────▶ │ Staging Area  │ ─────────────▶ │  Local Repo     │ ────────────▶│  Remote (GitHub)│
│  (file bạn sửa)  │              │  (index)      │                │  (.git/ trên máy)│              │  (origin)       │
└─────────────────┘  ◀─────────── └───────────────┘  ◀───────────── └────────────────┘  ◀────────────└────────────────┘
                        git restore --staged           git reset          git pull / fetch
```

Đây chính là 4 bước bạn vừa thấy trong session trước:
```bash
git add CLAUDE.md README.md ARCHITECTURE.md ...   # Working Dir  → Staging Area
git commit -m "Add email/password authentication..."  # Staging Area → Local Repo (tạo 1 commit mới)
git push origin main                                # Local Repo   → Remote (GitHub)
```

- **Working Directory**: các file thật trong `C:\Users\ADMIN\MHikeRN` — sửa gì cũng chỉ nằm ở đây trước.
- **Staging Area** (hay "index"): danh sách các thay đổi **đã chọn** để đưa vào commit tiếp theo. `git add file.js` = "tôi muốn file này nằm trong commit sắp tới". Đây là lý do bạn có thể sửa 5 file nhưng chỉ commit 3 file — Git không bắt commit "tất cả những gì đang sửa".
- **Local Repo**: lịch sử commit lưu trong `.git/` — `git commit` mới thực sự tạo ra 1 "điểm lưu" (snapshot) vĩnh viễn trong lịch sử.
- **Remote**: bản sao của Local Repo nằm trên GitHub — `git push` đẩy các commit local lên đó, `git pull` kéo commit mới từ đó về.

`git status` là lệnh cho biết **hiện đang ở trạng thái nào** trong sơ đồ trên (file nào ở Working Dir chưa add, file nào đã ở Staging Area).

---

## 3. Commit thực sự là gì

Chạy `git log --oneline` trên repo này ra:
```
4243f74 Add email/password authentication and architecture docs
6f4dc41 Fix Firestore auth race, index error, and detail-screen crash; add hike editing
eca2cc7 Migrate to React Navigation and add core hike screens
610afc3 Add Firebase integration and update app structure
a127b0b Initial commit
```

Mỗi dòng là **1 commit** = 1 "snapshot" toàn bộ trạng thái repo tại thời điểm đó, không phải chỉ là "diff". Mỗi commit có:
- 1 **hash** (`4243f74...` — thực ra dài 40 ký tự, Git chỉ hiện tắt 7 ký tự đầu vì đủ để không trùng) — hash này tính từ **nội dung** commit (file thay đổi + message + commit cha), nên **sửa bất kỳ thứ gì → hash đổi hoàn toàn**.
- 1 (hoặc nhiều, nếu là merge commit) **commit cha** — đây là lý do lịch sử tạo thành 1 chuỗi liên kết ngược, giống linked list: `4243f74` biết cha nó là `6f4dc41`, cứ thế lùi về `a127b0b` (initial commit, không có cha).
- Tác giả, thời gian, message.

→ **Git không lưu "diff giữa các bản"** như nhiều người tưởng — nó lưu snapshot đầy đủ mỗi lần commit (nhưng nén/tối ưu thông minh để không tốn dung lượng cho phần không đổi). `git diff` chỉ là **tính toán lại** sự khác biệt giữa 2 snapshot khi bạn cần xem.

📖 https://git-scm.com/book/en/v2/Git-Internals-Git-Objects

---

## 4. Branch và HEAD

Repo này hiện chỉ có **1 branch**: `main` (kiểm tra bằng `git branch -a` → chỉ thấy `main` và `remotes/origin/main`).

- **Branch** về bản chất chỉ là **1 con trỏ** (1 file text nhỏ trong `.git/refs/heads/`) trỏ tới 1 commit cụ thể — không phải "1 bản copy toàn bộ code" như nhiều người tưởng tượng. Đó là lý do tạo/xóa branch trong Git **cực nhanh** (khác SVN cũ).
- **HEAD** = con trỏ chỉ "bạn đang đứng ở đâu" — bình thường HEAD trỏ tới branch hiện tại (`main`), branch đó lại trỏ tới commit mới nhất.
- Khi bạn `git commit`, Git tạo commit mới → **branch hiện tại tự động dịch chuyển** để trỏ tới commit mới đó. Đây là lý do "checkout sang branch khác" sẽ đổi toàn bộ file trong Working Directory — Git đang đổi HEAD sang trỏ 1 chuỗi lịch sử khác.

```
main ──▶ 4243f74 ──▶ 6f4dc41 ──▶ eca2cc7 ──▶ 610afc3 ──▶ a127b0b
 ▲
HEAD
```

📖 https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell

---

## 5. Remote — "origin" nghĩa là gì

```bash
$ git remote -v
origin  git@github.com:loganlee23011-vn/mhike.git (fetch)
origin  git@github.com:loganlee23011-vn/mhike.git (push)
```

- `origin` chỉ là 1 **cái tên** (alias) mặc định Git đặt cho remote đầu tiên khi bạn `git clone` — không có gì đặc biệt về mặt kỹ thuật, bạn có thể có nhiều remote với tên khác (`upstream`, `backup`...) nếu cần.
- URL dạng `git@github.com:...` là **SSH** (không phải HTTPS `https://github.com/...`) — nghĩa là máy bạn xác thực với GitHub bằng **SSH key** đã đăng ký sẵn (không cần nhập username/password mỗi lần push). Đây là lý do `git push` trong session trước chạy thẳng không hỏi đăng nhập gì.
- `branch.main.remote=origin` + `branch.main.merge=refs/heads/main` (xem trong `git config --local -l`) là cấu hình **"tracking"**: branch `main` local biết nó tương ứng với `main` trên `origin` → đó là lý do bạn gõ được `git push` / `git pull` ngắn gọn (không cần `git push origin main` mỗi lần, dù ở trên mình vẫn gõ đầy đủ cho rõ).

📖 https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes

---

## 6. `.gitignore` — vì sao 1 số file "biến mất" khỏi git

File `.gitignore` của repo này:
```
node_modules/
**/firebaseConfig.js
**/google-services.json
.env
.env*.local
/ios
/android
...
```

- Đây không phải "xóa file" — file vẫn nằm trên máy bạn, Git **chỉ đơn giản là lờ nó đi**, không bao giờ đưa vào `git add`/`git status`/commit.
- Lý do dùng cho từng nhóm:
  - `node_modules/` — hàng chục nghìn file thư viện, **tái tạo được** bằng `npm install` từ `package.json` → không cần (và không nên) commit.
  - `firebaseConfig.js`, `.env` — chứa **config/secret riêng của từng máy** (API key) → mỗi dev tự tạo file này ở máy mình (dựa theo `.env.example` làm mẫu), không đẩy lên GitHub công khai.
  - `/ios`, `/android` — thư mục native code **tự sinh ra** khi cần build native (Expo prebuild) → không phải nguồn code gốc, không cần track.
- Đây chính là lý do lần trước bạn thấy `firebaseConfig.js` nằm trong danh sách `??` (untracked) hoặc thậm chí không hiện ở `git status` luôn dù file có tồn tại trên máy — nó bị `.gitignore` chặn hoàn toàn.

⚠️ Lưu ý quan trọng: `.gitignore` **chỉ ngăn được từ lúc thêm rule trở đi**. Nếu 1 file đã lỡ được commit trước khi thêm vào `.gitignore`, nó vẫn còn nguyên trong lịch sử — phải dùng lệnh riêng (`git rm --cached`) để bỏ track, và nếu secret đã lộ thì phải **đổi key đó**, xóa khỏi `.gitignore` không xóa được lịch sử cũ.

📖 https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

---

## 7. Vòng đời 1 thay đổi — từ sửa code tới lên GitHub

Đúng những gì vừa xảy ra trong session trước, đầy đủ các bước:

```bash
# 1. Xem đang có gì thay đổi
git status
git diff                       # xem chi tiết nội dung đổi (chưa staged)

# 2. Chọn file muốn đưa vào commit
git add src/screens/LoginScreen.js src/services/authService.js

# 3. Đóng gói thành 1 commit (1 "điểm lưu" có ý nghĩa)
git commit -m "Add email/password authentication"

# 4. Đẩy commit local lên GitHub
git push origin main

# 5. (khi làm việc nhóm / nhiều máy) kéo commit mới nhất người khác đã push
git pull origin main
```

Mỗi commit nên là **1 đơn vị thay đổi có ý nghĩa** (1 tính năng, 1 bug fix) — không nên gộp 10 việc không liên quan vào 1 commit, và cũng không nên commit từng dòng code lặt vặt. Nhìn lại `git log` của repo: mỗi commit đúng là 1 "cột mốc" rõ ràng (thêm Firebase, migrate navigation, sửa bug X, thêm auth) — đây là **best practice thật sự** dùng trong mọi dự án chuyên nghiệp, không chỉ coursework.

📖 https://cbea.ms/git-commit/ (bài kinh điển về cách viết commit message tốt)

---

## 8. Cách 1 project thật (nhóm nhiều người) dùng GitHub — khác gì bạn đang làm

Repo `mhike` hiện tại: **1 người, 1 branch `main`, commit thẳng vào `main`, push thẳng lên `origin/main`**. Cách này ổn cho coursework solo. Nhưng trong công ty / dự án nhóm thật, quy trình thường khác hẳn:

### 8.1 Feature branch — không ai code thẳng trên `main`
```
main ──●──────────────────●─────────────▶
        \                /
         ●──●──●────────●   feature/add-search
```
- Mỗi người tạo 1 branch riêng cho từng tính năng: `git checkout -b feature/add-search`.
- Code, commit thoải mái trên branch đó — **không ảnh hưởng `main`** (branch của người khác vẫn chạy ổn định).
- Xong việc mới gộp (merge) branch đó vào `main`.

### 8.2 Pull Request (PR) — trái tim của cộng tác trên GitHub
- Thay vì `git merge` thẳng trên máy, người ta **push branch feature lên GitHub** rồi mở 1 **Pull Request**: "tôi muốn gộp branch `feature/add-search` vào `main`, đây là các thay đổi, review giúp tôi".
- PR hiện rõ **diff** toàn bộ thay đổi, cho phép đồng nghiệp **comment trực tiếp trên từng dòng code** (code review), yêu cầu sửa trước khi merge.
- Thường gắn với **CI checks bắt buộc** (xem mục 8.4) — PR chỉ merge được khi build/test pass.
- Sau khi được duyệt (approve), người có quyền bấm **Merge** trên GitHub → lúc đó `main` mới thực sự nhận thay đổi.

### 8.3 3 cách merge PR (khác nhau về lịch sử để lại)
| Cách | Kết quả trong `git log` |
|---|---|
| **Merge commit** | Giữ nguyên toàn bộ commit của branch + thêm 1 commit "Merge pull request #12" | 
| **Squash and merge** | Gộp **toàn bộ** commit của branch thành **1 commit duy nhất** trên `main` (lịch sử `main` sạch, gọn) |
| **Rebase and merge** | "Chép" từng commit của branch lên đầu `main`, không tạo merge commit, lịch sử thẳng 1 đường |

Repo này hiện có lịch sử **thẳng 1 đường** (`a127b0b → 610afc3 → eca2cc7 → 6f4dc41 → 4243f74`) — giống hệt kết quả của squash/rebase, vì thực chất bạn đang commit thẳng, không qua merge branch nào.

### 8.4 CI/CD — GitHub Actions
- File YAML trong `.github/workflows/` (repo này **chưa có**) định nghĩa: "mỗi khi có commit mới / mở PR, tự động chạy lệnh gì" — ví dụ `npm test`, `npm run lint`, build thử app.
- Mục đích: bắt lỗi **trước khi** merge vào `main`, không phụ thuộc hoàn toàn vào việc con người tự nhớ chạy test.
- Có thể cấu hình **branch protection rule**: "không cho merge PR vào `main` nếu CI chưa pass" hoặc "phải có ít nhất 1 người approve".

### 8.5 Fork — khi đóng góp vào repo **không phải của bạn**
- Với repo bạn có quyền ghi (như `mhike` — bạn là chủ), bạn tạo branch trực tiếp trong repo đó.
- Với repo **open-source của người khác** (bạn không có quyền push), quy trình là: **Fork** (tạo 1 bản sao repo đó về tài khoản bạn trên GitHub) → clone bản fork về máy → sửa, commit, push lên **fork của bạn** → mở PR **từ fork của bạn vào repo gốc** → chủ repo gốc review và merge.

📖 https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests

---

## 9. Merge conflict — khi nào xảy ra, xử lý sao

Xảy ra khi **2 commit khác nhau sửa cùng 1 vùng dòng code** trong cùng 1 file mà Git không tự đoán được nên giữ bản nào. Ví dụ 2 branch cùng sửa dòng 10 của `HomeScreen.js` theo 2 cách khác nhau rồi merge lại.

Khi conflict, Git chèn thẳng vào file các dấu:
```js
<<<<<<< HEAD
const title = "Trang chủ";
=======
const title = "Home Dashboard";
>>>>>>> feature/rename-title
```
Bạn phải **tự sửa tay** thành bản đúng (xóa các dấu `<<<<<<<`/`=======`/`>>>>>>>`), rồi `git add` file đó để báo "tôi đã giải quyết xong", cuối cùng `git commit` để hoàn tất merge.

→ Conflict **không phải lỗi** — nó là cơ chế an toàn của Git để không tự ý chọn bừa khi 2 người sửa cùng chỗ. Cách giảm conflict: chia nhỏ task theo file/khu vực khác nhau, commit/pull thường xuyên (đừng để 1 branch tách khỏi `main` quá lâu).

📖 https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line

---

## 10. Issues & Project boards — quản lý công việc, không chỉ code

- **Issues**: 1 "phiếu việc cần làm" hoặc "báo lỗi" trên GitHub — có tiêu đề, mô tả, có thể gán người, gắn nhãn (`bug`, `enhancement`...), thảo luận qua comment.
- Có thể **link Issue với commit/PR**: viết `Fixes #12` trong commit message hoặc mô tả PR → khi PR đó merge, Issue #12 **tự động đóng**.
- **Project board** (kiểu Kanban: To do / In progress / Done) gom nhiều Issue lại để nhìn tổng thể tiến độ — hữu ích khi làm nhóm nhiều người, theo dõi ai đang làm gì.

📖 https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues

---

## 11. Tag & Release — đánh dấu 1 phiên bản chính thức

- `git tag v1.0.0` gắn 1 cái tên cố định vào 1 commit cụ thể (khác branch — tag **không di chuyển** khi có commit mới).
- GitHub **Release** = 1 tag + mô tả changelog + (tuỳ chọn) file đính kèm (ví dụ file `.apk` build sẵn) — dùng khi cần nộp bài / phát hành bản dùng thử cho giảng viên hoặc người dùng cuối tải về mà không cần clone code.
- Quy ước đặt tên phổ biến: **Semantic Versioning** `MAJOR.MINOR.PATCH` (vd `1.2.3`) — tăng MAJOR khi phá vỡ tương thích, MINOR khi thêm tính năng mới, PATCH khi chỉ sửa bug.

📖 https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases

---

## 12. GitHub Secrets — khác gì với `.env` ở máy bạn

- `.env`/`firebaseConfig.js` (mục 6) là secret **local**, chỉ dùng khi bạn tự chạy app trên máy mình.
- Khi có **GitHub Actions** cần build app tự động (chạy trên server của GitHub, không phải máy bạn), server đó không có sẵn file `.env` của bạn (vì nó bị `.gitignore`, không nằm trong repo). Lúc đó cần khai báo secret ở **Settings → Secrets and variables → Actions** trên GitHub — CI đọc secret từ đó, không bao giờ hiện ra trong log hay code.
- Đây là lý do secret **không bao giờ nên hardcode trong code rồi commit** — kể cả cho riêng CI dùng, luôn phải qua cơ chế Secrets riêng.

📖 https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions

---

## 13. Bảng lệnh Git dùng nhiều nhất — cheat sheet

| Lệnh | Làm gì |
|---|---|
| `git status` | Xem file nào đổi, đã staged hay chưa |
| `git diff` | Xem nội dung thay đổi (working dir vs staging) |
| `git diff --staged` | Xem nội dung đã `add`, sắp commit |
| `git add <file>` | Đưa file vào staging area |
| `git commit -m "..."` | Tạo 1 commit từ staging area |
| `git log --oneline` | Xem lịch sử commit rút gọn |
| `git push origin main` | Đẩy commit local lên GitHub |
| `git pull origin main` | Kéo commit mới từ GitHub về + tự merge |
| `git branch` | Liệt kê branch local |
| `git checkout -b <name>` | Tạo branch mới và chuyển sang nó |
| `git checkout main` | Chuyển về branch `main` |
| `git clone <url>` | Tải toàn bộ repo (kèm lịch sử) về máy lần đầu |
| `git restore --staged <file>` | Bỏ file ra khỏi staging (không mất thay đổi) |
| `git stash` | Cất tạm thay đổi chưa commit, để chuyển việc khác rồi lấy lại sau |

---

## 14. Áp dụng vào chính đồ án COMP1786 này

Vì đây là coursework solo (1 người), quy trình PR/branch/review đầy đủ như mục 8 là **không bắt buộc** — commit thẳng `main` như bạn đang làm là hợp lý và đơn giản. Vài điều vẫn nên giữ để commit history "chuyên nghiệp" (giảng viên có thể xem lịch sử commit như 1 phần đánh giá quá trình làm việc):

1. **Commit theo từng tính năng/việc rõ ràng**, không gộp lung tung — repo này đang làm đúng điều đó (5 commit = 5 cột mốc rõ ràng: Initial → Firebase → Navigation → Fix bugs → Auth).
2. **Message mô tả "vì sao" chứ không chỉ "cái gì"** (đúng convention `CLAUDE.md` đã đặt ra cho code comment, áp dụng luôn cho commit message).
3. Có thể cân nhắc dùng **branch riêng cho phần port sang Android Java** (feature a–d) khi bắt đầu, để lịch sử RN và lịch sử Android tách bạch rõ ràng, dễ trình bày trong Section 5 của báo cáo (folder structure 2 app).
4. Trước khi nộp bài, có thể tạo 1 **Release/tag** (`v1.0-submission`) đánh dấu đúng commit nộp — tránh nhầm lẫn nếu bạn code thêm sau deadline.

---

## 15. Gợi ý học thêm

1. Git nội bộ hoạt động ra sao (object, tree, blob): https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
2. Git Branching tương tác (học bằng cách chơi): https://learngitbranching.js.org/
3. GitHub Flow chính thức (workflow PR đơn giản, phổ biến nhất hiện nay): https://docs.github.com/en/get-started/using-github/github-flow
4. GitHub Actions từ đầu: https://docs.github.com/en/actions/writing-workflows/quickstart
