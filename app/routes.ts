import {
  index,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  ...prefix("plog", [
    index("./routes/plog-index.tsx"),
    route("blogitem-040601-1/q/*", "./routes/lyrics-search.tsx"),
    route("blogitem-040601-1/song/*", "./routes/lyrics-song.tsx"),
    route("blogitem-040601-1/*", "./routes/lyrics-post.tsx"),
    route(":oid/comment/:commentoid", "./routes/plog-comment.tsx"),
    route(":oid/*", "./routes/plog-splat.tsx"),
  ]),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("search", "routes/search.tsx"),
  route("*", "routes/home-splat.tsx"),
] satisfies RouteConfig
