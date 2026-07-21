# Kiến trúc & Luồng hoạt động — M-Hike RN

Tài liệu này giải thích **cách app React Native (MHikeRN) hoạt động thực tế**, dựa trên việc đọc trực tiếp source code (không chỉ theo spec trong `CLAUDE.md`). Mục đích: nắm được flow, kiến trúc, API, và các hàm/hook quan trọng trước khi demo.

> Lưu ý: một vài điểm trong `CLAUDE.md` (spec/thiết kế) **chưa khớp 100% với code hiện tại** — các điểm này được đánh dấu ⚠️ bên dưới để bạn không bị bất ngờ khi demo hoặc khi giảng viên hỏi.

---

## 1. Bức tranh tổng thể

```
┌─────────────────────────────┐        ┌─────────────────────────────┐
│   Android app (Java/MVVM)   │        │   React Native app (Expo)   │
│  (port sau, chưa nằm trong  │        │        MHikeRN (repo này)   │
│   repo này)                 │        │                              │
└──────────────┬───────────────┘        └──────────────┬───────────────┘
               │                                        │
               └───────────────┬────────────────────────┘
                                ▼
                    Firebase (BaaS — không có server riêng)
                    ├─ Firebase Auth      (email/password)
                    ├─ Firestore          (collections: hikes, observations)
                    └─ Security Rules     (firestore.rules)

           App còn gọi 2 API ngoài (chỉ từ RN app, phía client):
           ├─ Expo Location (GPS trên máy)
           └─ OpenWeatherMap REST API (thời tiết theo lat/lon)
```

Không có backend tự viết. Toàn bộ "API layer" chính là **Firebase JS SDK** gọi thẳng từ app xuống Firestore/Auth. Đây là mô hình **BaaS (serverless)**.

---

## 2. Kiến trúc theo lớp (thực tế trong code)

```
Screens (src/screens/*.js)
   │  gọi hook, KHÔNG gọi Firestore trực tiếp
   ▼
Context/Hooks (src/context/*.js)   ← đóng vai trò "ViewModel"
   │  useFirebase()   → { uid, ready }
   │  useHikeForm()   → { form, setFields, resetForm, startEdit }
   ▼
Services (src/services/*.js)       ← đóng vai trò "Repository"
   │  hikeService, observationService, authService,
   │  locationService, weatherService
   ▼
Firebase JS SDK (firebaseConfig.js) → Firestore / Auth
Expo SDK (expo-location)            → GPS
fetch()                             → OpenWeatherMap REST API
```

Quy tắc đang được tuân thủ trong code: **màn hình (screen) không bao giờ import trực tiếp `firebase/firestore`** — luôn đi qua file trong `src/services/`. Đây là cách RN "giả lập" MVVM bằng Context API + hooks thay vì ViewModel/LiveData như bên Android.

---

## 3. Cấu trúc thư mục thực tế

```
MHikeRN/
├── App.js                          # entry point, lắp các Provider + NavigationContainer
├── src/
│   ├── components/
│   │   ├── ScreenHeader.js         # header dùng chung: back / title / subtitle / icon phải
│   │   └── StepIndicator.js        # thanh "Step X of 3" cho wizard thêm hike
│   ├── constants/
│   │   ├── theme.js                # colors, spacing, radius, typography (design tokens)
│   │   └── terrainImages.js        # map terrainType -> ảnh nền (mountain/forest/coastal/valley/other)
│   ├── context/
│   │   ├── FirebaseContext.js      # theo dõi trạng thái đăng nhập (auth state)
│   │   └── HikeFormContext.js      # state tạm của form "thêm/sửa hike" qua 3 bước
│   ├── navigation/
│   │   ├── RootNavigator.js        # chọn AuthNavigator hay MainTabs tuỳ đã login hay chưa
│   │   ├── AuthNavigator.js        # stack Login/Register
│   │   └── MainTabNavigator.js     # bottom tab: Home/Hikes/Map/More
│   ├── screens/                    # 13 màn hình (chi tiết ở mục 6)
│   └── services/
│       ├── firebaseConfig.js       # khởi tạo Firebase app/auth/db (gitignored)
│       ├── authService.js          # đăng ký/đăng nhập/đăng xuất
│       ├── hikeService.js          # CRUD + realtime cho collection "hikes"
│       ├── observationService.js   # CRUD + realtime cho collection "observations"
│       ├── locationService.js      # lấy GPS qua expo-location
│       └── weatherService.js       # gọi OpenWeatherMap
├── firestore.rules                 # Security Rules
└── .env / .env.example             # EXPO_PUBLIC_OPENWEATHER_API_KEY
```

---

## 4. Luồng khởi động app

`App.js` lồng các Provider theo thứ tự:

```jsx
<SafeAreaProvider>
  <FirebaseProvider>       {/* 1. chờ Firebase Auth xác định user, show spinner */}
    <HikeFormProvider>     {/* 2. state form thêm/sửa hike (dùng toàn app) */}
      <NavigationContainer>
        <RootNavigator />  {/* 3. quyết định render gì */}
      </NavigationContainer>
    </HikeFormProvider>
  </FirebaseProvider>
</SafeAreaProvider>
```

**`FirebaseContext.js`** — bên trong dùng `onAuthStateChanged(auth, callback)` của Firebase Auth SDK:
- Khi app mở, Firebase kiểm tra token đã lưu (SDK tự lưu ở AsyncStorage). Trong lúc chờ, `ready = false` → app hiển thị `ActivityIndicator` toàn màn hình (tránh nháy màn hình Login rồi mới vào Home).
- Khi có kết quả: `uid = user.uid` (đã đăng nhập) hoặc `uid = null` (chưa đăng nhập), `ready = true`.

**`RootNavigator.js`** đọc `uid` từ `useFirebase()`:
```js
if (!uid) return <AuthNavigator />;      // chưa login → chỉ có Login/Register
return <Stack.Navigator>...</Stack.Navigator>;  // đã login → toàn bộ app
```

→ Đây chính là cơ chế "route guard": không cần kiểm tra login trong từng màn hình, chỉ cần đứng ở gốc cây navigation.

---

## 5. Xác thực (Authentication)

File: `src/services/authService.js`, dùng trực tiếp Firebase Auth SDK (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`).

- Không có đăng nhập ẩn danh (anonymous) — đúng như spec.
- Lỗi Firebase (`auth/xxx`) được map sang tiếng Anh dễ hiểu qua `ERROR_MESSAGES` (ví dụ `auth/wrong-password` → "Incorrect password.").
- `RegisterScreen.js`: validate email bắt buộc, password ≥ 6 ký tự, confirm password khớp — validate **trước khi** gọi Firebase (tiết kiệm round-trip).
- `LoginScreen.js` / `RegisterScreen.js` không tự điều hướng sau khi login — vì `FirebaseContext` sẽ tự nhận `onAuthStateChanged` và `RootNavigator` tự chuyển sang `MainTabs`.
- Đăng xuất: `MoreScreen.js` gọi `signOutUser()` → `onAuthStateChanged` bắn `null` → tự động rơi về `AuthNavigator`.

```
User bấm "Sign In"
   → signInWithEmail(email, password)
   → Firebase Auth xác thực, set session
   → onAuthStateChanged fire trong FirebaseContext
   → uid thay đổi → RootNavigator re-render → hiện MainTabs
```

---

## 6. Điều hướng (Navigation) — React Navigation

3 tầng lồng nhau:

```
RootNavigator (native-stack, headerShown: false)
├── AuthNavigator (khi chưa login)
│     ├── Login
│     └── Register
└── (khi đã login)
      ├── MainTabs = MainTabNavigator (bottom-tabs)
      │     ├── Home
      │     ├── Hikes
      │     ├── Map
      │     └── More
      ├── Search           # push từ Hikes/More
      ├── EntryBasic       # bước 1 wizard thêm/sửa hike
      ├── EntryRoute       # bước 2
      ├── EntryLocation    # bước 3
      ├── Confirm          # review trước khi lưu
      ├── Detail           # chi tiết 1 hike, nhận params { hikeId }
      └── Observations     # danh sách quan sát của 1 hike, nhận params { hikeId }
```

Toàn bộ 4 tab dùng `MaterialIcons` làm icon, active color = `colors.primary` (xanh rêu `#1E5631`).

---

## 7. Mô hình dữ liệu Firestore (đúng theo code, không phải chỉ theo spec)

### Collection `hikes`
| Field | Type | Ghi chú |
|---|---|---|
| id | string | doc id tự sinh |
| userId | string | chủ sở hữu (uid) |
| name, location | string | bắt buộc |
| hikeDate | Timestamp | bắt buộc, lưu qua `Timestamp.fromDate()` |
| parkingAvailable | boolean | bắt buộc |
| length | number | km |
| difficulty | string | Easy / Moderate / Hard / **Expert** (4 mức, không phải 3 như spec) |
| description | string | optional |
| estimatedDuration | string | vd "3 - 5 hours" |
| terrainType | string | Mountain / Forest / Coastal / Valley / Other — **cũng quyết định ảnh nền hiển thị** |
| latitude, longitude | number \| null | từ GPS (feature g) |
| weather | map \| null | cache kết quả OpenWeatherMap tại thời điểm tạo hike |
| createdAt, updatedAt | server Timestamp | tự set bởi `serverTimestamp()` |

### Collection `observations`
| Field | Type | Ghi chú |
|---|---|---|
| id, hikeId, userId | string | `hikeId` trỏ tới `hikes.id` |
| observationText | string | bắt buộc |
| observedAt | Timestamp | mặc định `new Date()` nếu không truyền |
| comments | string | optional (UI hiện tại **chưa có ô nhập comments** — field tồn tại trong service nhưng `ObservationScreen` chỉ có 1 ô text) |
| latitude, longitude, weather | — | field tồn tại trong `addObservation()` nhưng **chưa được UI nào set giá trị** (luôn `null`) |

⚠️ **Khác biệt với spec:** feature "location + weather" (feature g) hiện tại chỉ được áp dụng khi **tạo hike mới** (`EntryLocationScreen`), chưa áp dụng cho từng **observation** riêng lẻ dù data model đã có sẵn field.

---

## 8. Quản lý state — 2 Context chính (đóng vai trò "ViewModel")

### `FirebaseContext` (`src/context/FirebaseContext.js`)
- Hook: `useFirebase()` → `{ uid, ready }`
- Dùng ở: mọi màn hình cần biết ai đang login (`ConfirmScreen`, `ObservationScreen`, `MoreScreen`...).

### `HikeFormContext` (`src/context/HikeFormContext.js`)
- Hook: `useHikeForm()` → `{ form, editingHikeId, setFields, resetForm, startEdit }`
- Đây là "bộ nhớ tạm" xuyên suốt 3 màn hình wizard (`EntryBasic → EntryRoute → EntryLocation → Confirm`). Vì React Navigation không tự lưu state giữa các màn hình, context này đóng vai trò **giữ dữ liệu form khi user điều hướng qua lại (kể cả bấm "Edit" từ ConfirmScreen quay lại 1 bước trước)**.
- `startEdit(hike)`: đổ dữ liệu 1 hike có sẵn vào form + set `editingHikeId` → toàn bộ 3 màn hình entry **dùng chung code cho cả "thêm mới" và "sửa"**, phân biệt bằng `editingHikeId` (null = thêm mới).
- `resetForm()`: được gọi khi bấm nút "X" (huỷ) trên `ScreenHeader`, hoặc sau khi save thành công, hoặc khi bấm FAB "+" từ Home/Hikes (đảm bảo không dính data cũ).

---

## 9. Các luồng nghiệp vụ chính

### 9.1 Thêm hike mới (wizard 3 bước + confirm)

```
HomeScreen/HikesScreen (FAB "+")
  → resetForm()
  → EntryBasicScreen   [Bước 1/3: Basic Information]
       validate: name, location, date (YYYY-MM-DD), parkingAvailable
  → EntryRouteScreen   [Bước 2/3: Trail Details]
       validate: length (số > 0)
       chọn difficulty (chip), terrainType (chip)
  → EntryLocationScreen [Bước 3/3: Location & Safety]
       nút "Use current location"
         → getCurrentLocation() (expo-location)
         → getCurrentWeather(lat, lon) (OpenWeatherMap)
         → setFields({ latitude, longitude, weather })
       (bước này không bắt buộc — có thể Continue mà không bấm nút)
  → ConfirmScreen       [Review]
       hiển thị lại toàn bộ 3 nhóm dữ liệu, có link "Edit" nhảy thẳng
       về đúng bước tương ứng (KHÔNG mất dữ liệu vì context vẫn giữ)
       bấm "Save Hike"
         → addHike(uid, form)  [hikeService.js]
         → resetForm()
         → navigation.replace("Detail", { hikeId })
```

Điểm hay: `EntryBasicScreen`/`EntryRouteScreen`/`EntryLocationScreen` validate **cục bộ theo từng bước** (không cho Continue nếu bước đó sai) — tương đương yêu cầu "validate + confirm trước khi save" trong spec, nhưng chia nhỏ theo từng bước thay vì 1 form dài.

### 9.2 Sửa hike

```
DetailScreen → bấm icon "edit"
  → startEdit(hike)   # đổ toàn bộ field hiện có vào form, set editingHikeId = hike.id
  → navigate("EntryBasic")   # user đi lại đúng 3 bước, thấy dữ liệu cũ, có thể sửa
  → ... → ConfirmScreen
       isEditing = true → nút hiện "Save Changes"
       bấm Save → updateHike(editingHikeId, {...})  [hikeService.js]
       → navigation.replace("Detail", { hikeId: editingHikeId })
```

### 9.3 Xóa hike

`hikeService.deleteHike(id)`:
```js
await deleteObservationsForHike(id);  // xóa hết observations liên quan trước
await deleteDoc(doc(db, "hikes", id));
```
→ Xóa hike sẽ **cascade xóa toàn bộ observations của hike đó** (thực hiện thủ công bằng 2 lệnh tuần tự trong JS, không phải transaction/cloud function). Có thể gọi từ `HikesScreen` (danh sách) hoặc `DetailScreen` (chi tiết), đều có `Alert.alert` xác nhận trước.

### 9.4 Reset toàn bộ database

`MoreScreen → "Reset database"` → `resetHikes(uid)`:
```js
query(hikesRef, where("userId", "==", uid))  // chỉ xóa hike CỦA MÌNH
→ Promise.all(snapshot.docs.map(d => deleteHike(d.id)))
```
Mỗi `deleteHike` lại tự xóa observations liên quan → reset sạch dữ liệu của riêng user đó (không đụng vào hike người khác, vì app cho phép đọc chung nhưng ghi/xóa riêng).

### 9.5 Xem danh sách / chi tiết hike (realtime)

- `HomeScreen`, `HikesScreen`, `SearchScreen`, `MapScreen` đều gọi `subscribeToHikes(onChange, onError)` trong `useEffect` — dùng `onSnapshot` (Firestore **realtime listener**, không phải fetch 1 lần).
- **Quan trọng cho pin/hiệu năng:** mỗi `useEffect` return hàm `unsubscribe` — React tự gọi khi component unmount → đúng yêu cầu NFR "detach listener khi màn hình không hiển thị".
- `DetailScreen` thì khác: dùng `getHikeById(id)` — **fetch 1 lần** (`getDoc`), không realtime, vì đây là màn hình xem chi tiết đơn lẻ, không cần cập nhật live.

### 9.6 Observations (ghi chú trong lúc hike)

- `ObservationScreen` nhận `hikeId` qua route params, subscribe realtime bằng `subscribeToObservations(hikeId, ...)`.
- ⚠️ Chi tiết kỹ thuật: hàm này **chỉ where() theo `hikeId`**, rồi **sort ở phía client** (`docs.sort(...)`) thay vì `orderBy` trên Firestore — comment trong code giải thích: tránh phải tạo composite index (`hikeId` + `observedAt`) mà project chưa cấu hình. Đây là quyết định kỹ thuật có chủ đích, không phải thiếu sót.
- Thêm/sửa/xóa quan sát dùng chung 1 form (1 ô text) — bấm "..." (more-vert) trên từng item để mở menu Edit/Delete (native `Alert.alert` làm action sheet).
- `HomeScreen` còn có `subscribeToRecentObservations(3, ...)` — lấy 3 quan sát mới nhất **trên toàn bộ app** (không lọc theo hike) để hiện ở mục "Recent Observations".

### 9.7 Tìm kiếm & lọc nâng cao

`SearchScreen.js` — **không query Firestore theo điều kiện**, mà:
1. Subscribe toàn bộ `hikes` (`subscribeToHikes`) 1 lần khi vào màn hình.
2. Lọc **hoàn toàn phía client** bằng hàm thuần `matches(hike, filters)`:
   - `query`: match **prefix** theo tên (`name.startsWith`) — đúng yêu cầu spec "search by name (prefix match)".
   - `difficulty`: so khớp tuyệt đối hoặc "All".
   - `location`: `includes` (không cần khớp đầu).
   - `minLength`/`maxLength`, `dateFrom`/`dateTo`: khoảng giá trị.
3. Kết quả chỉ hiện sau khi bấm "Apply Filters" (`results` khởi tạo `null` để phân biệt "chưa tìm" và "tìm ra 0 kết quả").

Cách này đơn giản, phù hợp vì dữ liệu 1 user thường không lớn — không cần composite index Firestore cho tìm kiếm đa điều kiện.

### 9.8 Bản đồ (Map)

`MapScreen.js` — cách làm khá đặc biệt, đáng chú ý khi demo:
- Không dùng `react-native-maps`, mà dùng **`react-native-webview`** nhúng 1 trang HTML dựng động (`buildMapHtml`), load thư viện **Leaflet.js** qua CDN (`unpkg.com`) + tile từ **OpenStreetMap** (miễn phí, không cần API key).
- Danh sách pin = tất cả hike có `latitude`/`longitude` (subscribe realtime từ `subscribeToHikes`).
- Giao tiếp 2 chiều Web ↔ Native qua `postMessage`:
  ```js
  // trong HTML/JS nhúng (chạy trong WebView):
  marker.on('click', () => window.ReactNativeWebView.postMessage(JSON.stringify({ hikeId })));
  // trong RN:
  onMessage={(event) => { const { hikeId } = JSON.parse(event.nativeEvent.data); navigation.navigate("Detail", { hikeId }); }}
  ```
- Nếu chưa có hike nào có toạ độ → hiện placeholder gợi ý dùng "Use current location" khi thêm hike.

### 9.9 Vị trí (GPS) + Thời tiết (OpenWeatherMap) — feature (g)

**`locationService.js`**:
```js
Location.requestForegroundPermissionsAsync()   // xin quyền vị trí lúc runtime
Location.getCurrentPositionAsync({ accuracy: Balanced })
→ { latitude, longitude }
```

**`weatherService.js`**:
```
GET https://api.openweathermap.org/data/2.5/weather
    ?lat={lat}&lon={lon}&appid={API_KEY}&units=metric
```
- `API_KEY` đọc từ `process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY` — Expo tự inject biến có prefix `EXPO_PUBLIC_` vào bundle client-side (đây là cách chính thống của Expo để expose "public" env var, **không phải bug lộ secret** — key OpenWeatherMap free tier vốn dùng client-side được).
- Response được rút gọn lại thành object gọn: `{ temperature, feelsLike, description, icon, windSpeed, humidity }` trước khi lưu vào Firestore — không lưu nguyên response thô của OpenWeatherMap.
- Được gọi duy nhất 1 lần tại `EntryLocationScreen` khi bấm "Use current location" — kết quả cache thẳng vào field `weather` của document `hikes`, **không tự làm mới** sau đó (đúng ý nghĩa "cached weather" trong spec).

---

## 10. Cơ chế Realtime của Firestore — vì sao UI luôn tự cập nhật

Cả app gần như không có nút "Refresh" nào, vì dùng `onSnapshot` thay vì gọi API 1 lần:

```
onSnapshot(query, callback)
   → Firestore SDK giữ 1 kết nối, mỗi khi có document khớp query thay đổi
     (thêm/sửa/xóa, kể cả do THIẾT BỊ KHÁC — app Android hoặc user khác) 
   → callback(snapshot) chạy lại → setState → React re-render
```
→ Đây là lý do 2 app (Android + RN) "chia sẻ dữ liệu" mà không cần polling: sửa 1 hike trên máy A, máy B thấy ngay nếu đang mở đúng màn hình subscribe.

⚠️ **Về offline persistence:** `CLAUDE.md` ghi nhận quyết định "bật Firestore offline persistence ở cả 2 app" để bù việc dùng Firestore thay vì SQLite. Tuy nhiên trong code hiện tại, `firebaseConfig.js` chỉ gọi `getFirestore(app)` **không** gọi `enableIndexedDbPersistence` / `initializeFirestore(..., { localCache: ... })`. Nghĩa là **tính năng offline hiện chưa thực sự được bật** — nếu demo yêu cầu "tắt mạng vẫn dùng được", cần bổ sung việc này trước, hoặc điều chỉnh phần báo cáo cho khớp thực tế.

---

## 11. Security Rules (`firestore.rules`)

```
allow read: if isSignedIn();                                    // ai login rồi cũng đọc được (chia sẻ cộng đồng)
allow create: if isSignedIn() && auth.uid == request.resource.data.userId;  // tạo phải gắn đúng uid của mình
allow update, delete: if isOwner(resource);                      // chỉ chủ mới sửa/xóa được
```
Áp dụng giống nhau cho cả `hikes` và `observations`.

✅ **Đã sửa:** trước đó file có 1 ký tự `A` thừa đứng riêng 1 dòng giữa 2 block `match` (lỗi cú pháp, sẽ khiến `firebase deploy --only firestore:rules` compile fail). Đã xóa ký tự thừa — rules hiện hợp lệ.

---

## 12. React Hooks dùng trong dự án — tra cứu nhanh

| Hook | Dùng ở đâu | Mục đích |
|---|---|---|
| `useState` | Hầu hết mọi screen | State cục bộ của form/list/loading/error |
| `useEffect` | Home, Hikes, Search, Map, Detail, Observations | Subscribe Firestore khi mount, unsubscribe khi unmount |
| `useContext` (qua `useFirebase`, `useHikeForm`) | Toàn app | Đọc/ghi state dùng chung, thay vai trò ViewModel |
| `useMemo` | `HikeFormContext` (giá trị context), `HomeScreen` (tính `upcoming`, `totalDistance`, `hikesById`), `MapScreen` (tính `pins`, `html`) | Tránh tính lại / tạo lại object mỗi lần render (đặc biệt quan trọng với `html` của WebView — tránh reload trang liên tục) |
| custom hook `useFirebase()` | `FirebaseContext.js` | Trả `{ uid, ready }` |
| custom hook `useHikeForm()` | `HikeFormContext.js` | Trả `{ form, editingHikeId, setFields, resetForm, startEdit }`, throw error nếu dùng ngoài Provider |

Không dùng Redux/Zustand/MobX — toàn bộ state global chỉ qua 2 Context ở trên, đúng tinh thần "Context API + hooks đóng vai trò ViewModel" ghi trong `CLAUDE.md`.

---

## 13. Bảng tra cứu nhanh: hàm service ↔ nơi dùng

| Hàm | File | Gọi từ |
|---|---|---|
| `subscribeToHikes` | hikeService.js | Home, Hikes, Search, Map |
| `getHikeById` | hikeService.js | Detail |
| `addHike` / `updateHike` | hikeService.js | Confirm |
| `deleteHike` | hikeService.js | Hikes, Detail (tự xóa observations kèm theo) |
| `resetHikes` | hikeService.js | More |
| `subscribeToObservations` | observationService.js | Observations |
| `subscribeToRecentObservations` | observationService.js | Home |
| `addObservation` / `updateObservation` / `deleteObservation` | observationService.js | Observations |
| `deleteObservationsForHike` | observationService.js | gọi nội bộ từ `deleteHike` |
| `registerWithEmail` / `signInWithEmail` / `signOutUser` | authService.js | Register, Login, More |
| `getCurrentLocation` | locationService.js | EntryLocation |
| `getCurrentWeather` | weatherService.js | EntryLocation |

---

## 14. Cấu hình cần có để chạy demo

- `src/services/firebaseConfig.js` — **bị gitignore**, phải tồn tại thủ công trên máy chạy (chứa `apiKey`, `projectId`,...).
- `.env` (copy từ `.env.example`) — cần `EXPO_PUBLIC_OPENWEATHER_API_KEY` để tính năng thời tiết hoạt động; thiếu biến này thì `getCurrentWeather` sẽ throw lỗi rõ ràng ngay (không fail âm thầm).
- Quyền vị trí: lần đầu bấm "Use current location", hệ điều hành sẽ hỏi quyền — cần Allow thì mới lấy được toạ độ + thời tiết.
- Tài khoản Firebase: cần đăng ký/đăng nhập trước khi vào được `MainTabs` (không có chế độ khách).

---

## 15. Tóm tắt các điểm khác biệt so với `CLAUDE.md` (đáng lưu ý khi báo cáo)

1. **Difficulty có 4 mức** (Easy/Moderate/Hard/**Expert**) trong code, spec chỉ liệt kê 3 mức (Easy/Moderate/Hard).
2. **Offline persistence của Firestore chưa được bật** trong `firebaseConfig.js`, dù đây là quyết định thiết kế đã "confirmed" trong spec.
3. **Weather/location cho từng observation** — field đã có trong data model và trong `addObservation()`, nhưng UI (`ObservationScreen`) chưa có phần nhập/hiển thị, nên luôn là `null`.
4. ~~`firestore.rules` có lỗi cú pháp~~ — **đã sửa** (mục 11).
5. Search chạy **hoàn toàn client-side** (không phải Firestore query) — hợp lý với quy mô dữ liệu hiện tại nhưng đáng nói rõ trong phần đánh giá/trade-off của báo cáo (Section 4).

---

## 16. Kiến thức nền tảng cần học — study guide theo từng phần code

Phần này liệt kê **từng khái niệm nền tảng** xuất hiện trong app, giải thích ngắn gọn nó *là gì / vì sao dùng*, chỉ thẳng ra *nó nằm ở đâu trong repo này*, và gợi ý tài liệu chính thức để đọc sâu hơn. Học theo thứ tự này là đi từ nền tảng React → tới các mảnh ghép đặc thù của app.

### 16.1 React cơ bản (bắt buộc nắm trước tiên)

| Khái niệm | Ý nghĩa | Ví dụ trong repo |
|---|---|---|
| Component | Hàm JS trả về UI (JSX) | mọi file trong `src/screens/`, `src/components/` |
| Props | Dữ liệu cha truyền xuống con | `ScreenHeader({ title, onBack, ... })` |
| State (`useState`) | Dữ liệu nội bộ, thay đổi → re-render | `const [hikes, setHikes] = useState([])` trong `HomeScreen.js` |
| JSX | Cú pháp viết HTML-like trong JS | toàn bộ phần `return (...)` của mỗi screen |
| Conditional rendering | `a ? <X/> : <Y/>` để hiện/ẩn UI | `errors.name ? <Text>...</Text> : null` (`EntryBasicScreen.js`) |
| Lists & `key` | Render mảng bằng `.map()`, mỗi item cần `key` duy nhất | `hikes.map((h) => <... key={h.id} />)` |

Nếu bạn chưa quen React, đây là thứ **phải học trước tất cả phần còn lại**, vì mọi thứ khác (hooks, navigation, context) đều xây trên nền này.
📖 Đọc: https://react.dev/learn

### 16.2 React Native & Expo — khác gì với React (web)

- Không có thẻ `<div>`, `<span>`, `<button>`... mà dùng `<View>`, `<Text>`, `<TouchableOpacity>`, `<TextInput>`, `<FlatList>`, `<ScrollView>` — các "native component" map trực tiếp xuống UI gốc của iOS/Android.
- Không dùng CSS file, mà dùng `StyleSheet.create({...})` — object JS với property gần giống CSS (camelCase: `backgroundColor` thay vì `background-color`). Xem cuối mỗi file screen trong repo — phần `const styles = StyleSheet.create({...})`.
- **Expo** là bộ công cụ bọc quanh React Native, giúp không cần tự cấu hình Xcode/Android Studio để chạy thử — có sẵn các module như `expo-location`, `expo-status-bar` mà repo đang dùng (xem `package.json`).
- File `App.js` là entry point — tương đương `main()`; `index.js` (không đọc ở trên nhưng luôn có trong project Expo) là nơi Expo gọi `App.js`.

📖 Đọc: https://reactnative.dev/docs/getting-started · https://docs.expo.dev/

### 16.3 React Hooks — hiểu bản chất, không chỉ "chỗ dùng"

Bảng ở mục 12 chỉ ra *nơi dùng*; ở đây là *hook đó thực sự làm gì*:

- **`useState(initial)`** → trả `[value, setValue]`. Gọi `setValue` sẽ làm component **re-render** với giá trị mới. Đây là cách React "nhớ" dữ liệu giữa các lần render (bình thường biến thường trong hàm sẽ mất khi hàm chạy lại).
- **`useEffect(fn, deps)`** → chạy `fn` **sau khi** component render xong, chỉ chạy lại khi phần tử trong mảng `deps` thay đổi. `deps = []` nghĩa là chỉ chạy **1 lần khi mount**. Nếu `fn` return 1 hàm (cleanup function), React tự gọi hàm đó khi component **unmount** — đây chính là chỗ `unsubscribe` được gọi (xem `HomeScreen.js` dòng `useEffect(() => { const unsub = subscribeToHikes(...); return () => unsub(); }, [])`).
- **`useContext(SomeContext)`** → đọc giá trị từ 1 `Context.Provider` gần nhất bao quanh component, không cần truyền props qua nhiều tầng (tránh "prop drilling"). Đây là cơ chế đứng sau `useFirebase()` và `useHikeForm()`.
- **`useMemo(fn, deps)`** → chỉ tính lại `fn()` khi `deps` đổi, ngược lại trả kết quả đã tính lần trước (cache trong bộ nhớ của component). Quan trọng khi tính toán tốn kém hoặc khi cần **giữ nguyên tham chiếu object** (object identity) để tránh side-effect không cần thiết — ví dụ `MapScreen.js` dùng `useMemo` cho biến `html` để WebView không bị build lại HTML (và reload trang) mỗi lần render.

📖 Đọc: https://react.dev/reference/react/hooks

### 16.4 Context API — pattern quản lý state toàn app

`createContext()` + `<Context.Provider value={...}>` + `useContext(Context)` là 3 mảnh của 1 pattern:
1. `createContext(default)` tạo ra 1 "kênh" dữ liệu.
2. `<FirebaseContext.Provider value={{ uid, ready }}>` (trong `FirebaseContext.js`) bơm giá trị vào kênh đó cho **mọi component con** bên trong, bất kể lồng sâu bao nhiêu tầng.
3. `useContext(FirebaseContext)` ở bất kỳ đâu bên trong sẽ đọc được giá trị mới nhất, và **tự re-render khi giá trị đổi**.

App này dùng đúng 2 Context (`FirebaseContext`, `HikeFormContext`) làm state toàn cục thay vì thư viện ngoài (Redux/Zustand) — hợp lý vì app không quá phức tạp. Đây cũng là điều `CLAUDE.md` nhắc tới khi nói "Context API + hooks đóng vai trò ViewModel" (so sánh với MVVM bên Android).

📖 Đọc: https://react.dev/learn/passing-data-deeply-with-context

### 16.5 React Navigation — điều hướng nhiều màn hình

- **Stack Navigator** (`createNativeStackNavigator`): các màn hình xếp chồng như ngăn kéo — `navigate()` đẩy màn mới lên trên, `goBack()` lùi lại 1 bước, `replace()` **thay thế** màn hiện tại (không thêm vào lịch sử — dùng khi Save xong rồi vào Detail, để bấm Back từ Detail không quay lại Confirm), `popToTop()` về thẳng màn gốc của stack (dùng khi bấm nút "X" huỷ wizard).
- **Bottom Tab Navigator** (`createBottomTabNavigator`): các tab ngang hàng, chuyển qua lại không "chồng" lên nhau như stack.
- **Nested navigators**: `RootNavigator` chứa cả `AuthNavigator` (khi chưa login) và các stack screen khác lồng `MainTabNavigator` bên trong — đây là lý do cấu trúc điều hướng có 3 tầng (mục 6).
- **Route params**: truyền dữ liệu giữa màn hình qua object thứ 2 của `navigate("Detail", { hikeId })`, đọc lại bằng `route.params?.hikeId` ở màn đích (`DetailScreen.js`, `ObservationScreen.js`).

📖 Đọc: https://reactnavigation.org/docs/getting-started

### 16.6 Firebase Authentication

- Là dịch vụ xác thực có sẵn của Google — không cần tự viết server xử lý mật khẩu, hash, token...
- `createUserWithEmailAndPassword` / `signInWithEmailAndPassword` trả về 1 `user` object, Firebase SDK tự lưu **session token** (an toàn, tự refresh) và tự khôi phục khi mở lại app.
- `onAuthStateChanged(auth, callback)` là **listener**, không phải hàm gọi 1 lần — nó bắn lại **mỗi khi trạng thái đăng nhập thay đổi** (login, logout, hoặc app vừa mở và Firebase vừa xác định xong ai đang login). Đây là cơ chế đứng sau toàn bộ `FirebaseContext.js`.
- Khái niệm quan trọng: **UID** (user id) — chuỗi định danh duy nhất Firebase gán cho mỗi tài khoản, dùng làm khoá liên kết dữ liệu (field `userId` trong mọi document).

📖 Đọc: https://firebase.google.com/docs/auth

### 16.7 Firestore — NoSQL document database

- Khác SQL (bảng/hàng/cột có schema cố định): Firestore tổ chức dữ liệu thành **collection** (tương tự "bảng") chứa nhiều **document** (tương tự "1 dòng", nhưng là JSON, mỗi document có thể có field khác nhau).
- Không có JOIN thật sự — `observations.hikeId` chỉ là 1 field string trỏ tới `hikes.id`, việc "join" (lấy tên hike ứng với observation) phải tự làm ở code app (xem `hikesById` trong `HomeScreen.js`).
- **`onSnapshot` vs `getDoc`/`getDocs`**: `getDoc` là lấy dữ liệu **1 lần** (giống `fetch` bình thường). `onSnapshot` mở 1 **kết nối lắng nghe liên tục** — mỗi khi dữ liệu khớp query đổi (do bất kỳ ai, bất kỳ thiết bị nào), callback chạy lại tự động. Đây là nền tảng của "realtime sync" nói ở mục 10.
- **`where()` / `orderBy()` / composite index**: Firestore yêu cầu tạo **index** thủ công (trên Firebase Console) cho các query lọc + sắp xếp trên nhiều field khác nhau cùng lúc. Đây là lý do `observationService.js` chọn sort ở client thay vì dùng `orderBy` kèm `where` (mục 9.6) — tránh phải tạo composite index.
- **`Timestamp`**: kiểu dữ liệu ngày-giờ riêng của Firestore (không phải `Date` của JS) — phải convert qua lại bằng `Timestamp.fromDate(jsDate)` khi ghi và `.toDate()` khi đọc (xem hàm `toDoc()` trong cả 2 service).
- **`serverTimestamp()`**: yêu cầu Firestore tự điền giờ **của server** lúc ghi (đáng tin hơn giờ máy client, tránh lệch múi giờ/đồng hồ sai).

📖 Đọc: https://firebase.google.com/docs/firestore

### 16.8 Firestore Security Rules

- Là 1 ngôn ngữ khai báo riêng (không phải JS thật), chạy **trên server Firebase**, kiểm tra mọi request đọc/ghi trước khi cho phép — đây là lớp bảo mật thay thế cho việc phải tự viết backend kiểm tra quyền.
- `request.auth` = thông tin người đang gọi request (nếu chưa login thì `null`). `resource.data` = dữ liệu document **đang có sẵn** trên server (dùng khi update/delete). `request.resource.data` = dữ liệu **sắp được ghi** (dùng khi create/update, để kiểm tra field `userId` có đúng người gửi không).
- Rules trong `firestore.rules` **không tự động áp dụng** — phải deploy lên Firebase (`firebase deploy --only firestore:rules` hoặc dán tay vào Console) thì mới có hiệu lực; sửa file local không ảnh hưởng gì tới app đang chạy cho tới khi deploy.

📖 Đọc: https://firebase.google.com/docs/firestore/security/get-started

### 16.9 REST API cơ bản (áp dụng cho OpenWeatherMap)

- `weatherService.js` là ví dụ REST API đơn giản nhất: 1 URL + query string (`?lat=...&lon=...&appid=...`), gọi bằng `fetch()`, nhận về JSON, tự parse field cần dùng.
- Khái niệm **API key**: chuỗi định danh app của bạn với dịch vụ bên thứ 3, để họ tính quota/tính phí — không phải mật khẩu người dùng.
- `response.ok` (HTTP status 200–299) là cách kiểm tra request có thành công không trước khi đọc body — `fetch()` **không tự throw lỗi** khi server trả 4xx/5xx, phải tự kiểm tra như `weatherService.js` đang làm.

📖 Đọc: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

### 16.10 Biến môi trường trong Expo (`EXPO_PUBLIC_...`)

- File `.env` chứa biến môi trường, không commit lên git (xem `.gitignore`).
- Expo có quy ước: biến nào **cần dùng được ở phía client** (trong bundle app) phải có tiền tố `EXPO_PUBLIC_` — Expo tự inject các biến này vào `process.env` lúc build. Biến **không** có tiền tố này sẽ không lọt vào bundle (dùng cho secret chỉ cần ở build-time, không cần ở runtime).
- Vì vậy OpenWeatherMap key nằm trong bundle app là **có chủ đích**, không phải rò rỉ — khác với `firebaseConfig.js` (file, không phải biến môi trường) bị gitignore vì lý do khác: tách config theo từng máy/dev, không phải vì bảo mật tuyệt đối (Firebase config vốn cũng public được, bảo mật thật nằm ở Security Rules).

📖 Đọc: https://docs.expo.dev/guides/environment-variables/

### 16.11 Runtime permissions (xin quyền lúc chạy) — GPS

- Từ Android 6 / iOS 8 trở đi, các quyền nhạy cảm (vị trí, camera...) phải **xin lúc app đang chạy**, không chỉ khai trong manifest lúc cài đặt.
- `Location.requestForegroundPermissionsAsync()` hiện popup hệ điều hành, trả về `status` (`granted`/`denied`). Code phải luôn kiểm tra `status` trước khi gọi API lấy toạ độ — xem `locationService.js`.

📖 Đọc: https://docs.expo.dev/versions/latest/sdk/location/

### 16.12 WebView + cầu nối JS (chỗ dễ gây bối rối nhất trong app này)

`MapScreen.js` chạy 1 trang HTML **hoàn toàn tách biệt** bên trong `<WebView>` — về bản chất là 1 trình duyệt mini nhúng trong app native. 2 "thế giới" (RN code và HTML/JS trong WebView) **không chia sẻ bộ nhớ**, chỉ nói chuyện được qua tin nhắn dạng chuỗi:
- RN → WebView: nhúng dữ liệu thẳng vào chuỗi HTML lúc build (`JSON.stringify(pins)` chèn vào script) — không có API gọi 2 chiều trực tiếp, phải build lại toàn bộ HTML mỗi khi `pins` đổi (đây là lý do cần `useMemo` để tránh build lại vô ích).
- WebView → RN: gọi `window.ReactNativeWebView.postMessage(string)` bên trong HTML, RN nhận qua prop `onMessage`, phải tự `JSON.parse` vì dữ liệu luôn là chuỗi.

Đây là kỹ thuật hay dùng khi cần nhúng thư viện web (như Leaflet) mà không có bản native tương đương cài sẵn, đổi lại là phải tự quản lý việc đồng bộ dữ liệu qua lại thủ công.

📖 Đọc: https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md

### 16.13 Leaflet.js + OpenStreetMap (thư viện bản đồ dùng trong WebView)

- **Leaflet** là thư viện JS mã nguồn mở để vẽ bản đồ tương tác (marker, popup, zoom...) — chạy hoàn toàn trong trình duyệt/WebView, không cần SDK native.
- **OpenStreetMap** là nguồn "tile" (ảnh bản đồ) miễn phí, không cần API key — khác Google Maps (cần key + có thể tính phí). Đây là lý do team chọn Leaflet + OSM thay vì `react-native-maps` (thường cần cấu hình Google Maps API key trên Android).

📖 Đọc: https://leafletjs.com/examples/quick-start/

### 16.14 Khái niệm kiến trúc tổng quát (để hiểu vì sao thiết kế thế này)

| Thuật ngữ | Giải thích ngắn | Liên hệ trong app |
|---|---|---|
| **BaaS** (Backend as a Service) | Dùng dịch vụ có sẵn (Firebase) thay vì tự viết + host server | Toàn bộ app không có backend riêng, chỉ có Firebase |
| **Repository pattern** | Gom hết logic truy cập dữ liệu vào 1 lớp trung gian, UI không đụng trực tiếp vào nguồn dữ liệu | Các file `src/services/*.js` |
| **MVVM** | Model – View – ViewModel: View chỉ hiển thị + bắt sự kiện, ViewModel giữ state và logic, Model là dữ liệu thuần | Bên Android (Java) sẽ làm đúng nghĩa; bên RN mô phỏng bằng Context + hooks |
| **Optimistic vs realtime UI** | App này không "optimistic update" (tự sửa UI trước rồi mới gọi API) — mà dựa hẳn vào `onSnapshot` tự trả dữ liệu mới về, nên UI luôn phản ánh đúng server, đổi lại có độ trễ nhỏ (thường vài trăm ms) | Mọi thao tác add/update/delete hike & observation |
| **Prefix search vs full-text search** | "Prefix match" (bắt đầu bằng) khác "full-text search" (tìm từ khoá ở bất kỳ đâu) — Firestore không có full-text search built-in, đây là lý do phải lọc client-side | `SearchScreen.js` |

---

### Gợi ý thứ tự học nếu bạn mới bắt đầu

1. React cơ bản (16.1) → 2. React Native + Expo (16.2) → 3. Hooks (16.3) → 4. Context API (16.4)
→ 5. React Navigation (16.5) → 6. Firebase Auth (16.6) → 7. Firestore (16.7) → 8. Security Rules (16.8)
→ 9. REST API + env vars (16.9, 16.10) → 10. Location + WebView/Leaflet (16.11–16.13, phần nâng cao, không bắt buộc để hiểu luồng chính).

Sau khi nắm 1–8, bạn sẽ đọc hiểu được **90% luồng chính của app** (thêm/sửa/xóa/xem hike, observations, đăng nhập). Phần 9–13 chỉ cần khi đụng tới feature (g) — vị trí, thời tiết, bản đồ.
