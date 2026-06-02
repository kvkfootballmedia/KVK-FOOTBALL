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
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
          <header className="mb-12 md:mb-20">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Rubrique</span>
              <h1 className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tight text-secondary">
                {category?.name || slug}
              </h1>
              <div className="w-24 h-2 bg-primary"></div>
            </div>
          </header>
    
          {posts.length > 0 ? (
            <div className="space-y-16 md:space-y-24">
              {/* Feature the first post */}
              {featuredPost && (
                <PostCard post={featuredPost} featured={true} />
              )}

              {remainingPosts.length > 0 && (
                <>
                  <div className="flex items-center gap-6">
                    <div className="w-2 h-6 bg-secondary"></div>
                    <h2 className="text-xl font-heading font-black uppercase tracking-widest text-secondary whitespace-nowrap">Plus de contenus</h2>
                    <div className="h-px bg-gray-200 w-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {remainingPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
             <div className="py-24 text-center border-2 border-gray-200 bg-white mt-12 flex flex-col items-center justify-center">
               <p className="text-2xl text-gray-400 font-heading font-bold uppercase tracking-widest mb-8">Cette rubrique est en cours de rédaction...</p>
               <Link href="/" className="px-8 py-4 bg-secondary text-white font-heading font-black uppercase tracking-widest text-sm hover:bg-primary transition-colors border border-transparent">
                 RETOUR À L'ACCUEIL
               </Link>
             </div>
          )}
        </div>
      );
    }
