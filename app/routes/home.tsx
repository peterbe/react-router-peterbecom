import Component from "./home-splat"
export { loader, headers, meta } from "./home-splat"
export default Component

// export default function Component({ loaderData }: Route.ComponentProps) {
//   if (loaderData instanceof Response) {
//     return loaderData;
//   }
//   if (loaderData instanceof Error) {
//     return <pre>{loaderData.message}</pre>;
//   }
//   const { page, posts, categories, nextPage, previousPage } = loaderData;

//   return (
//     <Homepage
//       posts={posts}
//       categories={categories}
//       nextPage={nextPage}
//       previousPage={previousPage}
//       page={page}
//     />
//   );
// }
