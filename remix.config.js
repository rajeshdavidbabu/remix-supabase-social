/** @type {import('@remix-run/dev').AppConfig} */
// import { flatRoutes } from "remix-flat-routes";

export default {
  ignoredRouteFiles: ["**/.*"],
  // routes: async (defineRoutes) => {
  //   return flatRoutes("routes", defineRoutes);
  // },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  tailwind: true,
  postcss: true,
};
