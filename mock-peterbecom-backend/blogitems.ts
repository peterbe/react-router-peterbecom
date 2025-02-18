export type Comment = {
  id: number
  oid: string
  comment: string
  name: string
  email: string
  hash?: string
  add_date?: string
  comments?: Comment[]

  // ???
}

type Blogitem = {
  oid: string
  title: string
  categories: string[]
  pub_date: string
  comments: Comment[]
  html: string
  disallow_comments: false
  split?: number
  url?: string
  open_graph_image?: string
  summary?: string
  hide_comments?: boolean
}

function generateFakeComments(howmany: number): Comment[] {
  const comments: Comment[] = []
  let date = new Date()
  let uuid = 0
  for (let i = 0; i < howmany; i++) {
    const comment: Comment = {
      id: uuid++,
      oid: `comment-${uuid}`,
      comment: `This is comment number ${uuid}.`,
      name: `Random name ${uuid}`,
      add_date: date.toISOString(),
      email: "",
    }
    if (Math.random() > 0.9) {
      comment.comments = generateFakeComments(Math.ceil(Math.random() * 5))
    }
    comments.push(comment)
    date = new Date(date.getTime() - 1000 * 60 * 60)
  }
  return comments
}

export const blogitems: Blogitem[] = [
  {
    oid: "blogitem-20030629-2128",
    title: "First news item of the new webpage",
    categories: ["General"],
    pub_date: "2025-02-13T12:41:56.501Z",
    comments: [],
    html: "<p>My <i>first</i> post</p>",
    disallow_comments: false,
    // split: null,
    // url: null,
    open_graph_image: undefined,
    summary: "",
  },
  {
    oid: "some-js-code",
    title: "Some JavaScript Code",
    categories: ["JavaScript"],
    pub_date: "2025-02-18T13:42:57.502Z",
    comments: [],
    html: "<p>Some day, put some JS code in here</p>",
    disallow_comments: false,
    open_graph_image: undefined,
    summary: "",
  },
  {
    oid: "some-web-dev",
    title: "Some Web Development Title",
    categories: ["Web development"],
    pub_date: "2025-02-20T14:42:57.502Z",
    comments: [],
    html: "<p>Bla bla bla</p>",
    disallow_comments: false,
    open_graph_image: undefined,
    summary: "",
  },
  {
    oid: "blogitem-040601-1",
    title: "Find song by lyrics",
    categories: ["Misc. links"],
    pub_date: "2004-06-01T16:00:00Z",
    comments: generateFakeComments(300),
    html: '<div id="root">  \n<form  \nstyle="margin:40px 0"  \naction="https://songsear.ch/q/"  \nonsubmit="document.location.href=\'https://songsear.ch/q/\'+ this.term.value; return false">  \n<div class="ui action fluid input">  \n  <input type="search" name="term" class="form-control x-large" placeholder="Type your lyrics search here..."\n     maxlength="150" aria-label="Lyrics search" />\n  <button class="ui button">Search</button>\n</div>\n\n</form>  \n</div>\n\n<p style="margin-bottom: 60px;text-align:center">  \nGo to <a href="https://songsear.ch/"  \ntitle="Search for song by lyrics"><b>Songsear.ch</b></a> to search for songs from lyrics.  \n</p>',
    url: "https://songsear.ch",
    disallow_comments: false,
    // split: null,
    // url: null,
    open_graph_image: undefined,
    summary: "",
    // previous_post: null,
    // next_post: null,
  },
]

blogitems.push(...generateBlogItems(100, ["Web development", "JavaScript"]))

blogitems.sort((a, b) => b.pub_date.localeCompare(a.pub_date))

function generateBlogItems(howmany: number, categories: string[]): Blogitem[] {
  let uuid = 1
  const items: Blogitem[] = []
  for (let i = 0; i < howmany; i++) {
    const item: Blogitem = {
      oid: `generated-${uuid++}`,
      title: `Title of blog item ${uuid}`,
      categories,
      pub_date: new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24 * uuid,
      ).toISOString(),
      comments: [],
      html: `<p>Blog post number ${uuid} for ${categories}</p>`,
      disallow_comments: false,
      open_graph_image: undefined,
      summary: "",
    }
    items.push(item)
  }
  return items
}
