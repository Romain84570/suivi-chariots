'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';

type Intervention = {
  id: string;
  date: string;
  marque: string;
  modele: string;
  panne: string;
  resolution: string;
  commentaire: string;
};

export default function Home() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<Intervention, 'id'>>({
    date: '',
    marque: '',
    modele: '',
    panne: '',
    resolution: '',
    commentaire: '',
  });

  // 🔄 1) Charger la liste depuis Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setInterventions(data);
      }
      setLoading(false);
    })();
  }, []);

  // ✏️ Handler des champs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Ajouter une intervention
  const ajouter = async () => {
    if (!form.marque || !form.modele || !form.panne) return;
    const nouvelle: Intervention = { id: uuidv4(), ...form };
    // Insert dans Supabase
    const { error } = await supabase
      .from('interventions')
      .insert(nouvelle);
    if (error) {
      console.error(error);
      return;
    }
    // Mise à jour locale optimiste
    setInterventions([nouvelle, ...interventions]);
    setForm({ date: '', marque: '', modele: '', panne: '', resolution: '', commentaire: '' });
  };

  // 🗑️ Supprimer
  const supprimer = async (id: string) => {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    setInterventions(interventions.filter((i) => i.id !== id));
  };

  // 🔍 Filtrer
  const filtrées = interventions.filter((i) =>
    `${i.marque} ${i.modele} ${i.panne}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <p>Chargement…</p>;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <Input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          <Input
            name="marque"
            placeholder="Marque"
            value={form.marque}
            onChange={handleChange}
          />
          <Input
            name="modele"
            placeholder="Modèle"
            value={form.modele}
            onChange={handleChange}
          />
          <Input
            name="panne"
            placeholder="Type de panne"
            value={form.panne}
            onChange={handleChange}
          />
          <Input
            name="resolution"
            placeholder="Résolution"
            value={form.resolution}
            onChange={handleChange}
          />
          <Textarea
            name="commentaire"
            placeholder="Commentaire"
            value={form.commentaire}
            onChange={handleChange}
          />
          <Button onClick={ajouter}>Ajouter</Button>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Input
          placeholder="🔍 Rechercher par marque, modèle ou panne…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 font-semibold">
            <tr>
              {['Date','Marque','Modèle','Panne','Résolution','Commentaire',''].map(h => (
                <th key={h} className="p-2 border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrées.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border">{item.marque}</td>
                <td className="p-2 border">{item.modele}</td>
                <td className="p-2 border">{item.panne}</td>
                <td className="p-2 border">{item.resolution}</td>
                <td className="p-2 border">{item.commentaire}</td>
                <td className="p-2 border text-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => supprimer(item.id)}
                  >
                    🗑️
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
