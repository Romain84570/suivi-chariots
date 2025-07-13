'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const data = localStorage.getItem('interventions');
    if (data) {
      setInterventions(JSON.parse(data));
    }
  }, []);

  // Sauvegarder dans localStorage dès que ça change
  useEffect(() => {
    localStorage.setItem('interventions', JSON.stringify(interventions));
  }, [interventions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const ajouterIntervention = () => {
    if (!form.marque || !form.modele || !form.panne) return;
    setInterventions([...interventions, { ...form }]);
    setForm({ date: '', marque: '', modele: '', panne: '', resolution: '', commentaire: '' });
  };

  const interventionsFiltrees = interventions.filter((i) =>
    `${i.marque} ${i.modele} ${i.panne}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>

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

      <div className="mb-4">
        <Input
          placeholder="🔍 Rechercher par marque, modèle ou panne..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
            </tr>
          </thead>
          <tbody>
            {interventionsFiltrees.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border">{item.marque}</td>
                <td className="p-2 border">{item.modele}</td>
                <td className="p-2 border">{item.panne}</td>
                <td className="p-2 border">{item.resolution}</td>
                <td className="p-2 border">{item.commentaire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}