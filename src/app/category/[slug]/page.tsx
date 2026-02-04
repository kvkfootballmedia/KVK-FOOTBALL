    import { api } from "@/services/api";
    import PostCard from "@/components/editorial/PostCard";
    import Link from "next/link";
    
    // Force dynamic rendering since we fetch data
    export const dynamic = 'force-dynamic';

    export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
      const { slug } = await params;
      
      let posts: any[] = [];
      let category = null;

      try {
        const { data: categoryData } = await api.categories.getBySlug(slug);
        
        if (categoryData) {
          category = categoryData;
          // In api.ts, getAll already uses category_id
          posts = await api.posts.getAll({ categoryId: categoryData.id });
        }
      } catch (error) {
        console.error("Error fetching category posts:", error);
      }

      const featuredPost = posts[0];
      const remainingPosts = posts.slice(1);
    
      return (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <header className="mb-20">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Rubrique</span>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-gray-900 italic-none italic">
                {category?.name || slug}
              </h1>
              <div className="w-24 h-2 bg-primary rounded-full"></div>
            </div>
          </header>
    
          {posts.length > 0 ? (
            <div className="space-y-24">
              {/* Feature the first post */}
              {featuredPost && (
                <PostCard post={featuredPost} featured={true} />
              )}

              {remainingPosts.length > 0 && (
                <>
                  <div className="flex items-center gap-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Plus de contenus</h2>
                    <div className="h-px bg-gray-100 w-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {remainingPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
             <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-white mt-12">
               <p className="text-2xl text-gray-300 font-serif italic mb-8">Cette rubrique est en cours de rédaction...</p>
               <Link href="/" className="px-8 py-3 bg-gray-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all rounded-full">
                 Retour à l'accueil
               </Link>
             </div>
          )}
        </div>
      );
    }
