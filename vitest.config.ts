export default {
  test: {
    globalSetup: "./tests/vitest.setup.ts",
    include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
}
