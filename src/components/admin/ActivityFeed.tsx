'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Activity, Clock, Shield, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getActivities(15);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('créé')) return <FileText className="w-4 h-4 text-green-500" />;
    if (action.includes('mis à jour')) return <Shield className="w-4 h-4 text-blue-500" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden flex flex-col h-[500px]">
      <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
         <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-900 flex items-center gap-2">
           <Activity className="w-4 h-4 text-primary" />
           Journal d'Activité
         </h2>
         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      
      <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
            Chargement...
          </div>
        ) : activities.length > 0 ? (
          <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
            {activities.map((activity) => (
              <div key={activity.id} className="relative pl-6 group">
                {/* Timeline dot */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-200 group-hover:border-primary transition-colors flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getActionIcon(activity.action)}
                      <p className="text-xs font-bold text-gray-900">
                        <span className="text-primary font-black uppercase tracking-widest mr-1 text-[10px]">
                          {activity.user?.full_name || 'Anonyme'}
                        </span>
                        {activity.action}
                      </p>
                    </div>
                    
                    {activity.details?.title && (
                      <Link href={`/kv0980gp-coffre/edit/${activity.entity_id}`} className="text-sm font-serif italic text-gray-500 hover:text-gray-900 transition-colors line-clamp-1 block mb-1">
                        « {activity.details.title} »
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">
            Aucune activité récente.
          </div>
        )}
      </div>
    </div>
  );
}
