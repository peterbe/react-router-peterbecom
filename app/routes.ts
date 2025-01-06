import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  ...prefix("plog", [
    index("./routes/plog-index.tsx"),
    route(":oid/*", "./routes/plog-splat.tsx"),
  ]),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("search", "routes/search.tsx"),
  route("*", "routes/home-splat.tsx"),
] satisfies RouteConfig
