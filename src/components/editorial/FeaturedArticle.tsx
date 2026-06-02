import Link from 'next/link';

interface FeaturedArticleProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  category?: {
    name: string;
    color_hex: string;
  };
  published_at?: string;
}

export default function FeaturedArticle({ article }: { article: FeaturedArticleProps }) {
  return (
    <Link href={`/article/${article.slug}`}>
      <div className="relative h-96 overflow-hidden rounded-lg group cursor-pointer shadow-lg">
        {/* Image */}
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent group-hover:from-black/80 transition" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {article.category && (
            <span
              className="inline-block px-3 py-1 rounded text-sm font-bold mb-4 text-white"
              style={{ backgroundColor: article.category.color_hex }}
            >
              {article.category.name}
            </span>
          )}
          <h3 className="text-3xl font-black mb-2 group-hover:text-red-300 transition line-clamp-3">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-gray-200 line-clamp-2 text-sm">{article.excerpt}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
