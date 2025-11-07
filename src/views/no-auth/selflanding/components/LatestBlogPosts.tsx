import LatestBlogPostsClient from "../../landing/components/LatestBlogPostsClient";

type LatestBlogPostProps = {
  type?: string;
};

async function fetchBlogs(limit = 5, offset = 0) {
  const res = await fetch(
    `https://odoo.travulu.in/api/blogs/list?limit=${limit}&offset=${offset}`,
    { cache: "no-store", next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
}

export default async function LatestBlogPosts({ type }: LatestBlogPostProps) {
  let posts = [];
  try {
    const data = await fetchBlogs(9, 0);
    posts = data?.results || [];
    if (type) {
      posts = posts.filter(
        (post: any) => post.category?.toLowerCase() === type.toLowerCase()
      );
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="max-w-[1120px] w-full mx-auto px-5 pt-[80px] pb-[60px]">
      <LatestBlogPostsClient posts={posts} />
    </div>
  );
}
