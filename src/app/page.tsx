'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';        // <— bien depuis '@/lib'
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

type Intervention = {
  id: string;
  date: string;
  serial: string;
  marque: string;
  modele: string;
  panne: string;
  resolution: string;
  horometre: string;
  commentaire: string;
};

export default function Home() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<Intervention, 'id'>>({
    date: '',
    serial: '',
    marque: '',
    modele: '',
    panne: '',
    resolution: '',
    horometre: '',
    commentaire: '',
  });

  // → 1) on charge la liste au démarrage
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
    })();
  }, []);

  // → 2) changement d’un champ de formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // → 3) ajouter une intervention
  const handleAdd = async () => {
    // champs obligatoires
    if (!form.date || !form.marque || !form.modele || !form.panne) {
      return alert('Date, marque, modèle et panne sont obligatoires');
    }
    const newItem: Intervention = { id: uuidv4(), ...form };

    // insertion dans Supabase
    const { data, error } = await supabase
      .from('interventions')
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert('Erreur à l’insertion');
    }

    // on met à jour l’état en tête de liste
    setInterventions([data, ...interventions]);
    // on réinitialise le formulaire
    setForm({
      date: '',
      serial: '',
      marque: '',
      modele: '',
      panne: '',
      resolution: '',
      horometre: '',
      commentaire: '',
    });
  };

  // → 4) suppression
  const handleDelete = async (id: string) => {
    await supabase.from('interventions').delete().eq('id', id);
    setInterventions(interventions.filter((i) => i.id !== id));
  };

  // → 5) export CSV
  const handleExport = () => {
    const header = ['Date','N° Série','Marque','Modèle','Panne','Résolution','Horomètre','Commentaire'];
    const rows = interventions.map((i) => [
      i.date, i.serial, i.marque, i.modele, i.panne, i.resolution, i.horometre, i.commentaire
    ]);
    const csv = [header, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'interventions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // → 6) filtrage
  const filtered = interventions.filter((i) =>
    `${i.serial} ${i.marque} ${i.modele} ${i.panne}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          <Input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            placeholder="Date"
          />
          <Input
            name="serial"
            value={form.serial}
            onChange={handleChange}
            placeholder="N° de série"
          />
          <Input
            name="marque"
            value={form.marque}
            onChange={handleChange}
            placeholder="Marque"
          />
          <Input
            name="modele"
            value={form.modele}
            onChange={handleChange}
            placeholder="Modèle"
          />
          <Input
            name="panne"
            value={form.panne}
            onChange={handleChange}
            placeholder="Panne"
          />
          <Input
            name="resolution"
            value={form.resolution}
            onChange={handleChange}
            placeholder="Résolution"
          />
          <Input
            name="horometre"
            value={form.horometre}
            onChange={handleChange}
            placeholder="Horomètre"
          />
          <Textarea
            name="commentaire"
            value={form.commentaire}
            onChange={handleChange}
            placeholder="Commentaire"
          />
          <Button type="button" onClick={handleAdd} className="col-span-full">
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center mb-4 space-x-2">
        <Input
          placeholder="🔍 Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleExport} variant="outline">
          Export CSV
        </Button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 font-semibold">
            <tr>
              {['Date','N° Série','Marque','Modèle','Panne','Résolution','Horomètre','Commentaire','Actions']
                .map((h) => (
                  <th key={h} className="p-2 border">{h}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border">{item.serial}</td>
                <td className="p-2 border">{item.marque}</td>
                <td className="p-2 border">{item.modele}</td>
                <td className="p-2 border">{item.panne}</td>
                <td className="p-2 border">{item.resolution}</td>
                <td className="p-2 border">{item.horometre}</td>
                <td className="p-2 border">{item.commentaire}</td>
                <td className="p-2 border text-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                  >
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
