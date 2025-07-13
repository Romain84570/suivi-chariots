'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

type Intervention = {
  date: string;
  marque: string;
  modele: string;
  panne: string;
  resolution: string;
  commentaire: string;
};

export default function Home() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Intervention>({
    date: '',
    marque: '',
    modele: '',
    panne: '',
    resolution: '',
    commentaire: '',
  });
  const [isClient, setIsClient] = useState(false);

  // Chargement localStorage côté client
  useEffect(() => {
    setIsClient(true);
    const data = localStorage.getItem('interventions');
    if (data) setInterventions(JSON.parse(data));
  }, []);

  // Sauvegarde
  useEffect(() => {
    if (isClient) localStorage.setItem('interventions', JSON.stringify(interventions));
  }, [interventions, isClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const ajouterIntervention = () => {
    if (!form.marque || !form.modele || !form.panne) return;
    setInterventions([...interventions, { ...form }]);
    setForm({ date: '', marque: '', modele: '', panne: '', resolution: '', commentaire: '' });
  };

  const supprimerIntervention = (idx: number) => {
    const next = [...interventions];
    next.splice(idx, 1);
    setInterventions(next);
  };

  const viderTout = () => {
    setInterventions([]);
    localStorage.removeItem('interventions');
  };

  const exportCSV = () => {
    const header = ['date','marque','modele','panne','resolution','commentaire'];
    const rows = interventions.map(i=>[i.date,i.marque,i.modele,i.panne,i.resolution,i.commentaire]);
    const csv = [header,...rows]
      .map(r=>r.map(f=>`"${(f||'').replace(/"/g,'""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'interventions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const interventionsFiltrees = interventions.filter(i =>
    `${i.marque} ${i.modele} ${i.panne}`.toLowerCase().includes(search.toLowerCase())
  );

  if (!isClient) return null;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={exportCSV}>Exporter CSV</Button>
        <Button variant="destructive" onClick={viderTout}>Vider tout</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <Input type="date" name="date" value={form.date} onChange={handleChange} />
          <Input name="marque" value={form.marque} onChange={handleChange} placeholder="Marque" />
          <Input name="modele" value={form.modele} onChange={handleChange} placeholder="Modèle" />
          <Input name="panne" value={form.panne} onChange={handleChange} placeholder="Type de panne" />
          <Input name="resolution" value={form.resolution} onChange={handleChange} placeholder="Résolution" />
          <Textarea name="commentaire" value={form.commentaire} onChange={handleChange} placeholder="Commentaire" />
          <Button onClick={ajouterIntervention}>Ajouter</Button>
        </CardContent>
      </Card>

      <Input
        className="mb-4"
        placeholder="🔍 Rechercher par marque, modèle ou panne..."
        value={search}
        onChange={e=>setSearch(e.target.value)}
      />

      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Marque</th>
              <th className="p-2 border">Modèle</th>
              <th className="p-2 border">Panne</th>
              <th className="p-2 border">Résolution</th>
              <th className="p-2 border">Commentaire</th>
              <th className="p-2 border w-12"></th>
            </tr>
          </thead>
          <tbody>
            {interventionsFiltrees.map((item, idx)=>(
              <tr key={idx} className="border-t">
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border">{item.marque}</td>
                <td className="p-2 border">{item.modele}</td>
                <td className="p-2 border">{item.panne}</td>
                <td className="p-2 border">{item.resolution}</td>
                <td className="p-2 border">{item.commentaire}</td>
                <td className="p-2 border text-center">
                  <Button size="icon" variant="ghost" onClick={()=>supprimerIntervention(idx)}>
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
