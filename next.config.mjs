<<<<<<< HEAD
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
=======
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
<<<<<<< HEAD
  turbopack: {
    root: workspaceRoot,
  },
=======
>>>>>>> 5f28b869fcfa531563af02805aeceaa3953acd47
}

export default nextConfig
