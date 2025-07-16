'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

// Type définition étendue
interface Intervention {
  id: string;
  date: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  horaMetre: string;
  panne: string;
  resolution: string;
  commentaire: string;
}

export default function Home() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<Intervention, 'id'>>({
    date: '',
    marque: '',
    modele: '',
    numeroSerie: '',
    horaMetre: '',
    panne: '',
    resolution: '',
    commentaire: '',
  });

  // Chargement initial
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });
      if (error) console.error(error);
      else if (data) setInterventions(data);
    })();
  }, []);

  // Handler champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ajouter
  const ajouter = async () => {
    if (!form.marque || !form.modele || !form.panne) return;
    const nouvelle: Intervention = { id: uuidv4(), ...form };
    const { error } = await supabase.from('interventions').insert(nouvelle);
    if (error) {
      console.error(error);
      return;
    }
    setInterventions([nouvelle, ...interventions]);
    setForm({ date: '', marque: '', modele: '', numeroSerie: '', horaMetre: '', panne: '', resolution: '', commentaire: '' });
  };

  // Supprimer
  const supprimer = async (id: string) => {
    const { error } = await supabase.from('interventions').delete().eq('id', id);
    if (error) console.error(error);
    else setInterventions(interventions.filter(i => i.id !== id));
  };

  // Export CSV
  const exportCSV = () => {
    const header = ['Date','Marque','Modèle','N° Série','Horamètre','Panne','Résolution','Commentaire'];
    const rows = interventions.map(i => [i.date,i.marque,i.modele,i.numeroSerie,i.horaMetre,i.panne,i.resolution,i.commentaire]);
    const csvContent = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interventions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = interventions.filter(i =>
    `${i.marque} ${i.modele} ${i.panne}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <Input type="date" name="date" value={form.date} onChange={handleChange} />
          <Input name="marque" value={form.marque} onChange={handleChange} placeholder="Marque" />
          <Input name="modele" value={form.modele} onChange={handleChange} placeholder="Modèle" />
          <Input name="numeroSerie" value={form.numeroSerie} onChange={handleChange} placeholder="N° Série" />
          <Input name="horaMetre" value={form.horaMetre} onChange={handleChange} placeholder="Horamètre" />
          <Input name="panne" value={form.panne} onChange={handleChange} placeholder="Type de panne" />
          <Input name="resolution" value={form.resolution} onChange={handleChange} placeholder="Résolution" />
          <Textarea name="commentaire" value={form.commentaire} onChange={handleChange} placeholder="Commentaire" />
          <Button onClick={ajouter}>Ajouter</Button>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button variant="secondary" onClick={exportCSV}>Exporter CSV</Button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Marque</th>
              <th className="p-2 border">Modèle</th>
              <th className="p-2 border">N° Série</th>
              <th className="p-2 border">Horamètre</th>
              <th className="p-2 border">Panne</th>
              <th className="p-2 border">Résolution</th>
              <th className="p-2 border">Commentaire</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border">{item.marque}</td>
                <td className="p-2 border">{item.modele}</td>
                <td className="p-2 border">{item.numeroSerie}</td>
                <td className="p-2 border">{item.horaMetre}</td>
                <td className="p-2 border">{item.panne}</td>
                <td className="p-2 border">{item.resolution}</td>
                <td className="p-2 border">{item.commentaire}</td>
                <td className="p-2 border text-center">
                  <Button variant="ghost" size="icon" onClick={() => supprimer(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

