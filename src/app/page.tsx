'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
  const [loading, setLoading] = useState(false);

  // 1️⃣ Charger la liste depuis Supabase au montage
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        console.error('Supabase select error', error);
      } else {
        setInterventions(data);
      }
      setLoading(false);
    })();
  }, []);

  // Handler générique pour tous les champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 2️⃣ Ajouter une intervention
  const ajouter = async () => {
    // validation rapide
    if (!form.date || !form.marque || !form.modele || !form.panne) {
      alert('Veuillez remplir au moins la date, la marque, le modèle et le type de panne.');
      return;
    }

    const nouvelle: Intervention = {
      id: uuidv4(),
      ...form,
    };

    const { error } = await supabase.from('interventions').insert([nouvelle]);
    if (error) {
      console.error('Erreur à l’insertion', error);
      alert('Erreur à l’insertion');
      return;
    }

    // On met à jour l’état local sans recharger tout
    setInterventions([nouvelle, ...interventions]);
    // On réinitialise le formulaire
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

  // 3️⃣ Supprimer
  const supprimer = async (id: string) => {
    const { error } = await supabase.from('interventions').delete().eq('id', id);
    if (error) {
      console.error('Erreur à la suppression', error);
      return;
    }
    setInterventions(interventions.filter((i) => i.id !== id));
  };

  // 4️⃣ Export CSV
  const exportCsv = () => {
    const header = ['Date','N° Série','Marque','Modèle','Panne','Résolution','Horomètre','Commentaire'];
    const rows = interventions.map(i => [
      i.date, i.serial, i.marque, i.modele, i.panne, i.resolution, i.horometre, i.commentaire
    ]);
    const csv = [header, ...rows].map(r => r.map(cell => `"${cell.replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interventions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 5️⃣ Filtrer à la volée
  const filtres = interventions.filter(i =>
    [i.date, i.serial, i.marque, i.modele, i.panne]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <Input type="date" name="date" value={form.date} onChange={handleChange} />
          <Input name="serial" value={form.serial} onChange={handleChange} placeholder="N° de série" />
          <Input name="marque" value={form.marque} onChange={handleChange} placeholder="Marque" />
          <Input name="modele" value={form.modele} onChange={handleChange} placeholder="Modèle" />
          <Input name="panne" value={form.panne} onChange={handleChange} placeholder="Type de panne" />
          <Input name="resolution" value={form.resolution} onChange={handleChange} placeholder="Résolution" />
          <Input name="horometre" value={form.horometre} onChange={handleChange} placeholder="Horomètre" />
          <Textarea name="commentaire" value={form.commentaire} onChange={handleChange} placeholder="Commentaire" />
          <div className="col-span-full">
            <Button onClick={ajouter} className="w-full">
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={exportCsv}>
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
            {filtres.map((item) => (
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
                  <Button size="icon" variant="ghost" onClick={() => supprimer(item.id)}>
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </td>
              </tr>
            ))}
            {filtres.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  {loading ? 'Chargement…' : 'Aucune intervention.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}