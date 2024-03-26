import replace from "rollup-plugin-replace";

export default {
  input: "src/index.jsx",
  output: {
    dir: "build",
    format: "es",
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
};
