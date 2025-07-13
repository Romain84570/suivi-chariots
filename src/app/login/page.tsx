'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error) setSent(true);
  };

  if (sent) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-xl font-bold mb-4">📨 Lien magique envoyé</h1>
        <p>Vérifie ta boîte mail et clique sur le lien pour te connecter.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Connexion</h1>
      <Input
        type="email"
        placeholder="ton@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button className="mt-4 w-full" onClick={sendMagicLink}>
        Recevoir le lien
      </Button>
    </main>
  );
}