import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const { id: establishmentId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Simula busca de itens da sua API Node
  useEffect(() => {
    const fetchItems = async () => {
      // await fetch(`http://localhost:3000/admin/items/${establishmentId}`)
      setLoading(false);
    };
    fetchItems();
  }, [establishmentId]);

  const handleSaveItem = async (itemData: any) => {
    toast({ title: "Item salvo!", description: "As alterações já estão no ar." });
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Cardápio</h1>
        <Button onClick={() => {}} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Item
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Aqui você faria um .map() nos itens vindo da sua API */}
        <div className="p-6 border rounded-xl bg-card shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold">Exemplo: X-Tudo</h3>
            <p className="text-sm text-muted-foreground">R$ 25,00</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Disponível</span>
              <Switch checked={true} />
            </div>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-10 p-4 bg-primary/10 rounded-lg border border-primary/20 text-center text-sm">
        Logado como Samuel Sousa Lustosa (Desenvolvedor)
      </div>
    </div>
  );
}