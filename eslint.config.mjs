import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

// any kullanımına izin ver
eslintConfig.push({
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
});

// Next.js App Router page dosyalarında params ile ilgili TS hatalarını ignore et
eslintConfig.push({
  ignorePatterns: ["src/app/(home)/odeme/[id]/page.tsx"],
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
  },
});

export default eslintConfig;