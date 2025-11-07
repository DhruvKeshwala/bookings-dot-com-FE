import React from "react";
import Image from "next/image";
import Script from "next/script";
import postcss from "postcss";
import prefixer from "postcss-prefix-selector";

// Fix Odoo image and SVG URLs
function fixOdooHtmlContent(html: string): string {
  return html
    .replace(/src="\/web\/image/g, 'src="https://odoo.travulu.in/web/image')
    .replace(/url\((['"]?)\/web\/image/g, 'url($1https://odoo.travulu.in/web/image')
    .replace(/src="\/web_editor\/shape/g, 'src="https://odoo.travulu.in/web_editor/shape')
    .replace(/url\((['"]?)\/web_editor\/shape/g, 'url($1https://odoo.travulu.in/web_editor/shape');
}

// Fetch blog details
async function fetchBlog(id: string) {
  const res = await fetch(`https://odoo.travulu.in/api/blog/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch blog");
  return res.json();
}

// Fetch Odoo CSS and prefix selectors to .odoo-blog-container
async function fetchScopedOdooCss() {
  const res = await fetch(
    "https://odoo.travulu.in/web/assets/1/05e2b8a/web.assets_frontend.min.css"
  );
  if (!res.ok) return "";

  const css = await res.text();

  const prefixedCss = await postcss([
    prefixer({
      prefix: ".odoo-blog-container",
      transform: (prefix, selector, prefixedSelector) => {
        // Skip scoping for global elements like header, footer, html, body, keyframes
        if (/^(html|body|:root|@|header|footer)/.test(selector)) return selector;
        return prefixedSelector;
      },
    }),
  ]).process(css, { from: undefined });

  return prefixedCss.css;
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parts = slug.split("-");
  const id = parts[parts.length - 1];

  const blog = await fetchBlog(id);

  const coverImageUrl = blog.cover
    ? blog.cover
        .replace(/^url\((['"])?/, "")
        .replace(/(['"])?\)$/, "")
        .replace(/^\/web\/image/, "https://odoo.travulu.in/web/image")
    : null;

  const scopedCss = await fetchScopedOdooCss();

  return (
    <>
      {/* Scoped Odoo CSS */}
      <style>{scopedCss}</style>

      {/* Reset leaked Odoo CSS from header */}
      <style>
        {`
          header, header * {}
            font-family: inherit;
          }
        `}
      </style>

      {/* Font Overrides */}
      <style>
        {`
          .odoo-blog-container h1,
          .odoo-blog-container h2,
          .odoo-blog-container h3,
          .odoo-blog-container h4,
          .odoo-blog-container h5,
          .odoo-blog-container h6 {
            font-family: 'Raleway', 'Raleway Fallback';
          }
          .odoo-blog-container {
            font-family: 'Nunito', 'Nunito Fallback';
          }
        `}
      </style>

      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css?family=Raleway:400,500,600,700|Nunito:300,400,500,600,700&display=swap"
        rel="stylesheet"
      />

      {/* Minimal Odoo JS */}
      <Script
        src="https://odoo.travulu.in/web/assets/1/f499882/web.assets_frontend_minimal.min.js"
        strategy="afterInteractive"
      />

      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
        {blog.subtitle && (
          <h2 className="text-xl font-semibold mb-6">{blog.subtitle}</h2>
        )}

        {coverImageUrl && (
          <div className="mb-8">
            <Image
              src={coverImageUrl}
              alt={blog.title}
              width={900}
              height={500}
              style={{ width: "100%", height: "auto" }}
              priority
              unoptimized
            />
          </div>
        )}

        {/* Blog Content safely scoped */}
        <div
          dangerouslySetInnerHTML={{
            __html: `<div class="odoo-blog-container">${fixOdooHtmlContent(
              blog.content
            )}</div>`,
          }}
        />
      </div>
    </>
  );
}
