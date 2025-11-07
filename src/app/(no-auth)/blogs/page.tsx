import React from "react";
import Link from "next/link";
import Image from "next/image";

async function fetchBlogs(limit = 20, offset = 0) {
  const res = await fetch(
    `https://odoo.travulu.in/api/blogs/list?limit=${limit}&offset=${offset}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
}

export default async function BlogListPage() {
  const blogsData = await fetchBlogs(20, 0);
  const blogs = blogsData?.results || [];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-7xl px-4 mx-auto">
        <h1 className="text-3xl font-bold text-primary font-raleway mb-10">
          All Blogs
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {blogs.map((post: any) => (
            <Link
                key={post.id}
                href={`/blog/${post.slug.split("/").pop()}`}
                className="block max-w-[250px] w-full"
              >
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-[#e0e0e0] transition hover:shadow-xl hover:-translate-y-2 duration-300"
            >
              <div className="w-full h-52 overflow-hidden bg-gray-100">
                {post.thumbnail && post.thumbnail !== "none" ? (
                  <Image
                    src={`https://odoo.travulu.in${post.thumbnail.replace(/^url\((['"]?)(.*?)\1\)$/, "$2")}`}
                    alt={post.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover transition duration-300 hover:scale-110"
                  />
                ) : (
                  <Image
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                    alt="placeholder"
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col flex-1 font-nunito">
                <span className="bg-[#E8E9F1] text-xs px-3 py-1 rounded-lg text-primary font-medium mb-2">
                  {post.category}
                </span>
                <h2 className="font-bold text-lg font-roboto mb-2">
                  {post.title}
                </h2>
                <p className="text-[#484848] text-sm mb-4 flex-1">
                  {post.excerpt}
                </p>
                {/* <Link
                  href={`/blog/${post.slug.split("/").pop()}`}
                  className="text-black font-semibold flex items-center gap-1 hover:underline group"
                > */}
                  Read more{" "}
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">
                    {">"}
                  </span>
                {/* </Link> */}
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
