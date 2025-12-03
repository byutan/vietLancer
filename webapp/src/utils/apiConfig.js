// webapp/src/utils/apiConfig.js

// Biến VITE_API_URL sẽ được lấy từ cấu hình trên Render sau này.
// Nếu không tìm thấy (tức là đang chạy ở máy local), nó sẽ dùng "http://localhost:3000"
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";