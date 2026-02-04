import PostCard from "@/components/editorial/PostCard";
import { supabase } from "@/lib/supabaseClient";

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. Fetch Author Profile
  const { data: author } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  // 2. Fetch Author Posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image, published_at, 
      categories:category_id(name, slug)
    `)
    .eq('author_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (!author) return <div className="py-24 text-center">Profil non trouvé.</div>;

  const transformedPosts = (posts || []).map(p => ({
    ...p,
    categories: p.categories ? [p.categories] : []
  }));

  return (
    <div className="container mx-auto px-4 py-24">
      <header className="mb-24 flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left border-b border-gray-100 pb-16">
        <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 shadow-2xl shrink-0">
          <img 
            src={author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.full_name}`} 
            alt={author.full_name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="max-w-2xl">
          <span className="bg-primary text-white px-3 py-1 text-xs font-black uppercase tracking-widest mb-4 inline-block">{author.role}</span>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-6">{author.full_name}</h1>
          {author.bio && (
            <p className="text-xl text-gray-600 font-serif leading-relaxed italic">
              "{author.bio}"
            </p>
          )}
        </div>
      </header>

      <section>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 border-b-2 border-gray-900 pb-2 inline-block">Ses Articles</h2>
        
        {transformedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {transformedPosts.map(post => (
              <PostCard key={post.id} post={post as any} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-gray-400 font-serif italic text-lg">
            Aucun article publié par cet auteur pour le moment.
          </div>
        )}
      </section>
    </div>
  );
}
