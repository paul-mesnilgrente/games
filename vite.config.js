import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is served from https://paul-mesnilgrente.com/games/
// so every asset & route must be prefixed with /games/.
export default defineConfig({
  base: '/games/',
  plugins: [react()],
})
