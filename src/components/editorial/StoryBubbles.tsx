'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { X, ExternalLink } from 'lucide-react';

interface Story {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  title: string | null;
  body_text: string | null;
  link_url: string | null;
}

interface StoryGroup {
  id: string;
  title: string;
  cover_image_url: string;
  stories: Story[];
}

export default function StoryBubbles() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  const STORY_DURATION = 5000; 
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      // 1. Groupes actifs
      const { data: groupData, error: groupErr } = await supabase
        .from('story_groups')
        .select('id, title, cover_image_url, sort_order')
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('sort_order', { ascending: true });

      if (groupErr) {
        console.error('[StoryBubbles] groups fetch error:', groupErr.message);
        return;
      }
      if (!groupData || groupData.length === 0) return;

      const groupIds = groupData.map(g => g.id);

      // 2. Stories filtrées explicitement par group_id (pas de dépendance RLS seule)
      const { data: storyData, error: storyErr } = await supabase
        .from('stories')
        .select('*')
        .in('group_id', groupIds)
        .order('sort_order', { ascending: true });

      if (storyErr) {
        console.error('[StoryBubbles] stories fetch error:', storyErr.message);
        return;
      }

      const formatted = groupData.map(group => ({
        id: group.id,
        title: group.title,
        cover_image_url: group.cover_image_url,
        stories: (storyData || []).filter(s => s.group_id === group.id),
      })).filter(g => g.stories.length > 0);

      setGroups(formatted);
    } catch (e) {
      console.error('[StoryBubbles] unexpected error:', e);
    }
  };

  const startProgress = useCallback(() => {
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    const startTime = Date.now();
    
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;
      
      if (newProgress >= 100) {
        clearInterval(progressInterval.current!);
        nextStory();
      } else {
        setProgress(newProgress);
      }
    }, 50);
  }, [activeGroupIndex, activeStoryIndex]);

  const pauseProgress = () => {
     if (progressInterval.current) clearInterval(progressInterval.current);
  };

  useEffect(() => {
    if (activeGroupIndex !== null) {
      startProgress();
    } else {
      pauseProgress();
    }
    return () => pauseProgress();
  }, [activeGroupIndex, activeStoryIndex, startProgress]);


  const nextStory = () => {
    if (activeGroupIndex === null) return;
    const currentGroup = groups[activeGroupIndex];
    
    if (activeStoryIndex < currentGroup.stories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else {
      if (activeGroupIndex < groups.length - 1) {
        setActiveGroupIndex(prev => prev! + 1);
        setActiveStoryIndex(0);
      } else {
        closeViewer();
      }
    }
  };

  const prevStory = () => {
    if (activeGroupIndex === null) return;
    
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else {
      if (activeGroupIndex > 0) {
         setActiveGroupIndex(prev => prev! - 1);
         setActiveStoryIndex(groups[activeGroupIndex - 1].stories.length - 1);
      } else {
        startProgress();
      }
    }
  };

  const openStory = (groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0);
  };

  const closeViewer = () => {
    setActiveGroupIndex(null);
    setActiveStoryIndex(0);
    setProgress(0);
  };

  if (groups.length === 0) return null;

  return (
    <>
      <div className="w-full bg-gray-100 border-b border-gray-200 py-3 md:py-6 relative z-40">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center gap-1.5 mb-2 md:mb-4">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary animate-pulse"></span>
            <h2 className="text-[9px] md:text-[11px] font-heading font-black uppercase tracking-widest text-secondary">Stories</h2>
          </div>

          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-4 scrollbar-hide snap-x">
            {groups.map((g, index) => (
              <button
                key={g.id}
                onClick={() => openStory(index)}
                className="flex flex-col items-start shrink-0 snap-start group w-20 md:w-36 text-left"
              >
                <div className="w-full aspect-[3/4] border-2 border-transparent group-hover:border-primary bg-gray-900 transition-colors duration-300 relative overflow-hidden mb-1 md:mb-2 shadow-sm">
                  <Image src={g.cover_image_url} alt={g.title} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-primary border border-white z-10"></div>
                </div>
                <span className="text-[9px] md:text-xs font-heading font-bold text-secondary uppercase tracking-tight line-clamp-2 w-full">
                  {g.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeGroupIndex !== null && groups[activeGroupIndex] && (
         <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center backdrop-blur-md">
            
            <div className="absolute inset-0 cursor-pointer hidden md:block" onClick={closeViewer} />

            <div 
              className="w-full h-full md:w-[400px] md:h-[80vh] md:max-h-[850px] bg-gray-900 border md:border-gray-800 relative overflow-hidden flex flex-col shadow-2xl z-10"
            >
               <div className="absolute top-0 left-0 right-0 p-4 pb-0 z-20 flex gap-1 bg-gradient-to-b from-black/80 to-transparent pt-6">
                 {groups[activeGroupIndex].stories.map((s, idx) => (
                   <div key={s.id} className="h-1 flex-1 bg-white/20 overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-75 ease-linear"
                        style={{ 
                          width: idx === activeStoryIndex ? `${progress}%` : (idx < activeStoryIndex ? '100%' : '0%') 
                        }}
                      />
                   </div>
                 ))}
               </div>

               <div className="absolute top-10 left-4 right-4 z-20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-gray-800 border border-white/50 relative overflow-hidden">
                       <Image src={groups[activeGroupIndex].cover_image_url} alt="" fill className="object-cover" />
                     </div>
                     <span className="text-white text-sm font-heading font-black uppercase tracking-widest text-shadow-sm">{groups[activeGroupIndex].title}</span>
                  </div>
                  <button onClick={closeViewer} className="p-2 text-white hover:text-primary transition-colors bg-black/50 backdrop-blur-sm border border-white/10">
                    <X className="w-5 h-5" />
                  </button>
               </div>

               <div 
                  className="flex-1 relative cursor-pointer"
                  onMouseDown={pauseProgress}
                  onMouseUp={startProgress}
                  onTouchStart={pauseProgress}
                  onTouchEnd={startProgress}
               >
                  <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
                  <div className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={(e) => { e.stopPropagation(); nextStory(); }} />

                  <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                    {groups[activeGroupIndex].stories[activeStoryIndex]?.media_url && (
                        <Image 
                            src={groups[activeGroupIndex].stories[activeStoryIndex].media_url} 
                            alt="" 
                            fill 
                            priority
                            className="object-cover opacity-30 blur-xl scale-125" 
                        />
                    )}

                    {groups[activeGroupIndex].stories[activeStoryIndex]?.media_type === 'video' ? (
                       <video 
                         src={groups[activeGroupIndex].stories[activeStoryIndex].media_url} 
                         autoPlay 
                         muted 
                         loop 
                         playsInline 
                         className="w-full h-full object-contain relative z-10"
                       />
                    ) : (
                       <Image 
                         src={groups[activeGroupIndex].stories[activeStoryIndex].media_url} 
                         alt="" 
                         fill 
                         priority
                         className="object-contain relative z-10" 
                       />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/95 z-10 pointer-events-none" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-20 pointer-events-none border-t border-white/10">
                     {groups[activeGroupIndex].stories[activeStoryIndex].title && (
                       <h3 className="text-white text-2xl font-heading font-black uppercase tracking-tight mb-2 leading-tight">
                          {groups[activeGroupIndex].stories[activeStoryIndex].title}
                       </h3>
                     )}
                     {groups[activeGroupIndex].stories[activeStoryIndex].body_text && (
                       <p className="text-gray-300 text-sm font-sans leading-relaxed">
                          {groups[activeGroupIndex].stories[activeStoryIndex].body_text}
                       </p>
                     )}
                     
                     {groups[activeGroupIndex].stories[activeStoryIndex].link_url && (
                        <div className="mt-6 pointer-events-auto">
                           <a 
                             href={groups[activeGroupIndex].stories[activeStoryIndex].link_url!}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 bg-primary text-white hover:bg-white hover:text-black px-6 py-3 text-xs font-heading font-black uppercase tracking-widest transition-colors w-full justify-center"
                           >
                             LIRE L'ARTICLE <ExternalLink className="w-4 h-4" />
                           </a>
                        </div>
                     )}
                  </div>
               </div>

            </div>
         </div>
      )}
    </>
  );
}
