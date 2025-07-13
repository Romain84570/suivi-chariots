'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuid } from 'uuid';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

type Intervention = {
  id: string;
  date: string;
  marque: string;
  modele: string;
  panne: string;
  resolution: string;
  commentaire: string;
};

export default async function Home() {
  // Vérifie la session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return <ClientComponent />;
}

/* Composant client séparé */
function ClientComponent() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<Intervention, 'id'>>({
    date: '',
    marque: '',
    modele: '',
    panne: '',
    resolution: '',
    commentaire: '',
  });

  useEffect(() => {
    // Lecture initiale
    (async () => {
      const { data } = await supabase.from('interventions').select('*').order('date', { ascending: false });
      if (data) setInterventions(data as Intervention[]);
    })();

    // Realtime
    const ch = supabase.channel('interventions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interventions' }, payload => {
        if (payload.eventType === 'INSERT') setInterventions(prev => [payload.new as Intervention, ...prev]);
        if (payload.eventType === 'DELETE') setInterventions(prev => prev.filter(i => i.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const add = async () => {
    if (!form.marque || !form.modele || !form.panne) return;
    await supabase.from('interventions').insert({ id: uuid(), ...form });
    setForm({ date:'', marque:'', modele:'', panne:'', resolution:'', commentaire:'' });
  };

  const del = async (id: string) => {
    await supabase.from('interventions').delete().eq('id', id);
  };

  const exportCSV = () => {
    const header = ['date','marque','modele','panne','resolution','commentaire'];
    const rows = interventions.map(i=>[i.date,i.marque,i.modele,i.panne,i.resolution,i.commentaire]);
    const csv = [header,...rows].map(r=>r.join(';')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'interventions.csv';
    link.click();
  };

  const liste = interventions.filter(i =>
    \`\${i.marque} \${i.modele} \${i.panne}\`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>
      <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={exportCSV}>Exporter CSV</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <Input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
          <Input placeholder="Marque" value={form.marque} onChange={e=>setForm({...form,marque:e.target.value})}/>
          <Input placeholder="Modèle" value={form.modele} onChange={e=>setForm({...form,modele:e.target.value})}/>
          <Input placeholder="Type de panne" value={form.panne} onChange={e=>setForm({...form,panne:e.target.value})}/>
          <Input placeholder="Résolution" value={form.resolution} onChange={e=>setForm({...form,resolution:e.target.value})}/>
          <Textarea placeholder="Commentaire" value={form.commentaire} onChange={e=>setForm({...form,commentaire:e.target.value})}/>
          <Button onClick={add}>Ajouter</Button>
        </CardContent>
      </Card>

      <Input className="mb-4" placeholder="🔍 Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}/>

      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100 font-semibold">
          <tr>
            {['Date','Marque','Modèle','Panne','Résolution','Commentaire',''].map(h=><th key={h} className="p-2 border">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {liste.map(i=>(
            <tr key={i.id} className="border-t">
              <td className="p-2 border">{i.date}</td>
              <td className="p-2 border">{i.marque}</td>
              <td className="p-2 border">{i.modele}</td>
              <td className="p-2 border">{i.panne}</td>
              <td className="p-2 border">{i.resolution}</td>
              <td className="p-2 border">{i.commentaire}</td>
              <td className="p-2 border text-center">
                <Button size="icon" variant="ghost" onClick={()=>del(i.id)}>
                  <Trash2 className="w-4 h-4"/>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}