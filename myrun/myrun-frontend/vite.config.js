// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 백엔드 실제 주소
// - 도커 네트워크에서:  http://myrun-backend:4000
// - 쿠버네티스에서:    http://myrun-backend:4000 (Service 이름 동일)
// 필요하면 로컬 개발에서만 BACKEND_URL 환경변수로 덮어쓸 수 있음.
const BACKEND_URL = process.env.BACKEND_URL || "http://myrun-backend:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 브라우저에서 /api 로 요청 → Vite dev 서버가 BACKEND_URL 로 프록시
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
