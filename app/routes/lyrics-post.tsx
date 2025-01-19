// import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
// import { json, redirect } from "@remix-run/node";
import { redirect } from "react-router";
// import { useLoaderData } from "@remix-run/react";
import * as v from "valibot";

import type { Route } from "./+types/lyrics-post";

import { Lyricspost } from "~/components/lyricspost";
import { get } from "~/lib/get-data";
// import global from "~/styles/build/global-lyricspost.css";
import { absoluteURL, newValiError } from "~/utils/utils";
import { ServerData } from "~/valibot-types";

export { ErrorBoundary } from "../root";

// export function links() {
//   return [{ rel: "stylesheet", href: global }];
// }

export async function loader({ params, request }: Route.LoaderArgs) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1));
  }
  if (pathname.endsWith("/p1")) {
    return redirect(pathname.slice(0, -3));
  }

  const dynamicPage = params["*"] || "";

  let page = 1;
  const oid = "blogitem-040601-1";
  for (const part of dynamicPage.split("/")) {
    if (!part) {
      // Because in JS,
      // > "".split('/')
      // [ '' ]
      continue;
    }
    if (/^p\d+$/.test(part)) {
      page = Number.parseInt(part.replace("p", ""), 10);
      if (Number.isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 });
      }
    }
  }

  const sp = new URLSearchParams({ page: `${page}` });
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`;

  const response = await get(fetchURL);
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 });
  }
  if (response.status !== 200) {
    console.warn(`UNEXPECTED STATUS (${response.status}) from ${fetchURL}`);
    throw new Error(`${response.status} from ${fetchURL}`);
  }
  try {
    const { post, comments } = v.parse(ServerData, response.data);

    // const cacheSeconds = 60 * 60 * 12;

    return { post, comments, page };
  } catch (error) {
    throw newValiError(error);
  }
}

export function headers() {
  // XXX This sould vary depending on loader data
  const seconds = 60 * 60;
  return {
    "cache-control": `public, max-age=${seconds}`,
  };
}

// function cacheHeaders(seconds: number) {
//   return { "cache-control": `public, max-age=${seconds}` };
// }

export function meta({ location, data }: Route.MetaArgs) {
  const pageTitle = "Find song by lyrics";
  const page = data?.page || 1;

  // The contents of the `<title>` has to be a string
  const title = `${pageTitle} ${
    page > 1 ? ` (Page ${page})` : " Looking for songs by the lyrics"
  }`;
  return [
    { title: title },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
    {
      name: "description",
      content: "Find songs by lyrics.",
    },
    {
      property: "og:description",
      content:
        "You can find the song if you only know parts of the song's lyrics.",
    },
  ];
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { post, comments, page } = loaderData;
  return <Lyricspost post={post} comments={comments} page={page} />;
}
