import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mxssdqqttwwcgxpkbgam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c3NkcXF0dHd3Y2d4cGtiZ2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzA2MDIsImV4cCI6MjA3MDQwNjYwMn0.WFADLRaPThKICQWkdNT2ayYLTNtSquZ04WVWps5UN08';

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export const saveSovereignState = async (nodes, edges) => {
    const stateMatrix = { nodes, edges, updated_at: new Date().toISOString() };

    // Try to persist to Supabase if configured & table exists
    if (supabase) {
        try {
            const { error } = await supabase
                .from('draft_aiy_workspaces')
                .upsert({ id: 'sovereign-matrix-1', data: stateMatrix });

            if (!error) {
                console.log('[Sovereign Log] Matrix synchronized to Global Database.');
                return;
            } else {
                console.warn('[Sovereign Log] Table missing. Failing over to Local Storage Vault.');
            }
        } catch (err) {
            console.warn('[Sovereign Log] Vault sync failed. Failing over to Local Matrix.');
        }
    }

    // Fallback / Local Zero-Illusion Persistence
    localStorage.setItem('draft_aiy_SovereignMatrix', JSON.stringify(stateMatrix));
    console.log('[Sovereign Log] Matrix strictly persisted to Edge LocalStorage.');
};

export const loadSovereignState = async () => {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('draft_aiy_workspaces')
                .select('*')
                .eq('id', 'sovereign-matrix-1')
                .single();

            if (data && !error) return data.data; // Return the nodes/edges payload
        } catch (err) {
            // Silent failover
        }
    }

    const localLayer = localStorage.getItem('draft_aiy_SovereignMatrix');
    if (localLayer) return JSON.parse(localLayer);

    return null;
};
