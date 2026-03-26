import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    {
      name: 'copy-legacy-script',
      writeBundle() {
        copyFileSync(
          resolve(__dirname, 'script.js'),
          resolve(__dirname, 'dist/script.js'),
        )
      },
    },
  ],
})
