import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/BG3-Random-Character-Generator/', // 레포명과 정확히 동일
})
