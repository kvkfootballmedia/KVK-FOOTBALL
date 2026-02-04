import PostCard from "@/components/editorial/PostCard";
import { api } from "@/services/api";

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tagName = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  let posts: any[] = [];
  try {
    // Assuming api.posts.getAll supports tag filtering or we can adjust it
    // For now, let's at least clear the mock data.
    posts = await api.posts.getAll({ tag: slug });
  } catch (error) {
    console.error("Error fetching tag posts:", error);
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <header className="mb-16 border-b-4 border-gray-900 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-primary text-white px-3 py-1 text-xs font-black uppercase tracking-widest">Tag</span>
          <h1 className="text-5xl font-black uppercase tracking-tighter">{tagName}</h1>
        </div>
        <p className="text-xl text-gray-600 font-serif max-w-2xl">
          Exploration des contenus liés au mot-clé "{tagName}". Une immersion dans les thématiques qui font le football d'aujourd'hui.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-gray-400 font-serif italic">
          Aucun article trouvé pour ce tag.
        </div>
      )}
    </div>
  );
}
