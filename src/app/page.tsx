'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Intervention = {
  id: string;
  date: string;
  numero_serie: string;
  marque: string;
  modele: string;
  panne: string;
  resolution: string;
  horametre: string;
  commentaire: string;
};

export default function Home() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [form, setForm] = useState({
    date: '',
    numero_serie: '',
    marque: '',
    modele: '',
    panne: '',
    resolution: '',
    horametre: '',
    commentaire: ''
  });
  const [search, setSearch] = useState('');

  // Charger interventions au démarrage
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) setInterventions(data);
      if (error) console.error("Erreur Supabase (chargement) :", error);
    };
    fetchData();
  }, []);

  // Gestion des champs de formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ajouter une intervention
  const ajouter = async () => {
    if (!form.marque || !form.modele || !form.panne) {
      alert('Merci de remplir au moins marque, modèle et panne.');
      return;
    }
    const { data, error } = await supabase
      .from('interventions')
      .insert([form])
      .select()
      .single();
    if (error) {
      alert("Erreur à l'insertion");
      console.error(error);
      return;
    }
    setInterventions([data as Intervention, ...interventions]);
    setForm({
      date: '',
      numero_serie: '',
      marque: '',
      modele: '',
      panne: '',
      resolution: '',
      horametre: '',
      commentaire: ''
    });
  };

  // Supprimer une intervention
  const supprimer = async (id: string) => {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', id);
    if (error) {
      alert("Erreur à la suppression");
      return;
    }
    setInterventions(interventions.filter(i => i.id !== id));
  };

  // Filtrage simple
  const interventionsFiltrees = interventions.filter((i) =>
    [
      i.date,
      i.numero_serie,
      i.marque,
      i.modele,
      i.panne,
      i.resolution,
      i.horametre,
      i.commentaire
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Suivi des interventions</h1>
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          <Input type="date" name="date" value={form.date} onChange={handleChange} />
          <Input name="numero_serie" value={form.numero_serie} onChange={handleChange} placeholder="N° Série" />
          <Input name="marque" value={form.marque} onChange={handleChange} placeholder="Marque" />
          <Input name="modele" value={form.modele} onChange={handleChange} placeholder="Modèle" />
          <Input name="panne" value={form.panne} onChange={handleChange} placeholder="Panne" />
          <Input name="resolution" value={form.resolution} onChange={handleChange} placeholder="Résolution" />
          <Input name="horametre" value={form.horametre} onChange={handleChange} placeholder="Horamètre" />
          <Textarea name="commentaire" value={form.commentaire} onChange={handleChange} placeholder="Commentaire" />
          <div className="col-span-full">
            <Button onClick={ajouter} className="w-full">
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center mb-4 space-x-2">
        <Input
          placeholder="🔍 Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">N° Série</th>
              <th className="p-2 border">Marque</th>
              <th className="p-2 border">Modèle</th>
              <th className="p-2 border">Panne</th>
              <th className="p-2 border">Résolution</th>
              <th className="p-2 border">Horamètre</th>
              <th className="p-2 border">Commentaire</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interventionsFiltrees.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border">{item.numero_serie}</td>
                <td className="p-2 border">{item.marque}</td>
                <td className="p-2 border">{item.modele}</td>
                <td className="p-2 border">{item.panne}</td>
                <td className="p-2 border">{item.resolution}</td>
                <td className="p-2 border">{item.horametre}</td>
                <td className="p-2 border">{item.commentaire}</td>
                <td className="p-2 border text-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => supprimer(item.id)}
                  >
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </td>
              </tr>
            ))}
            {interventionsFiltrees.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  Aucune intervention.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}