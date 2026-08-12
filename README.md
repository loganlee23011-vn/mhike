# M-Hike (MHikeRN)

M-Hike là ứng dụng di động ghi lại và quản lý các chuyến đi bộ đường dài (hiking), xây dựng bằng **React Native + Expo**, dùng **Firebase** làm backend (Authentication + Firestore).

## Tính năng chính

- **Đăng nhập / Đăng ký** với Firebase Authentication, hỗ trợ "remember me".
- **Quản lý chuyến hike**: tạo mới theo từng bước (thông tin cơ bản → vị trí → lộ trình → xác nhận), xem danh sách, xem chi tiết, chỉnh sửa.
- **Ghi nhận vị trí**: dùng vị trí thiết bị để lưu nơi diễn ra chuyến hike, hiển thị trên bản đồ (`MapScreen`).
- **Thời tiết**: lấy thông tin thời tiết tại vị trí hike (`weatherService`).
- **Quan sát (Observations)**: thêm ghi chú/quan sát chi tiết cho từng chuyến hike, kèm kiểm duyệt cộng đồng.
- **Tìm kiếm** chuyến hike theo tiêu chí (`SearchScreen`).

## Công nghệ sử dụng

- [Expo](https://expo.dev/) (SDK 54) + React Native 0.81
- React Navigation (bottom tabs + native stack)
- Firebase (`firebase` JS SDK) — Authentication & Firestore
- `expo-location`, `expo-secure-store`, `@react-native-async-storage/async-storage`

## Cấu trúc thư mục

```
src/
├── components/      # Component dùng chung (header, step indicator...)
├── constants/        # Theme, ảnh địa hình...
├── context/           # FirebaseContext, HikeFormContext
├── navigation/        # Auth/Main/Root navigator
├── screens/            # Các màn hình (Login, Hikes, Detail, Map, Search...)
└── services/           # authService, hikeService, observationService, weatherService...
```

## Bắt đầu

### Yêu cầu

- Node.js
- Expo CLI (`npx expo`)
- Tài khoản Firebase với project đã bật Authentication và Firestore

### Cài đặt

```bash
npm install
```

### Cấu hình Firebase

Cập nhật thông tin project Firebase trong `src/services/firebaseConfig.js` và các rule bảo mật trong `firestore.rules`.

### Chạy ứng dụng

```bash
npm start        # mở Expo Dev Tools
npm run android  # chạy trên Android
npm run ios      # chạy trên iOS
npm run web      # chạy trên web
```

## Giấy phép

Xem file [LICENSE](./LICENSE).
