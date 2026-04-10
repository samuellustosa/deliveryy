import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';

export default function Complementos() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [options, setOptions] = useState([{ name: '', price: 0 }]);

  const { data: groups } = useQuery({ 
    queryKey: ['option-groups'], 
    queryFn: () => api.getOptionGroups() 
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.createOptionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
      setName('');
      setOptions([{ name: '', price: 0 }]);
      toast.success('Grupo de complementos criado!');
    }
  });

  const addOptionField = () => setOptions([...options, { name: '', price: 0 }]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tighter">Complementos</h1>

      <Card>
        <CardHeader><CardTitle>Novo Grupo (Ex: Adicionais de Açaí)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Nome do Grupo" value={name} onChange={e => setName(e.target.value)} />
          
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase">Opções e Preços</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <Input 
                  placeholder="Nome (Ex: Leite em Pó)" 
                  value={opt.name} 
                  onChange={e => {
                    const newOpts = [...options];
                    newOpts[idx].name = e.target.value;
                    setOptions(newOpts);
                  }} 
                />
                <Input 
                  type="number" 
                  placeholder="Preço" 
                  value={opt.price} 
                  onChange={e => {
                    const newOpts = [...options];
                    newOpts[idx].price = Number(e.target.value);
                    setOptions(newOpts);
                  }} 
                />
              </div>
            ))}
            <Button variant="outline" onClick={addOptionField} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Linha
            </Button>
          </div>

          <Button onClick={() => mutation.mutate({ name, options })} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Salvar Grupo
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Grupos Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups?.map(group => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg uppercase">{group.name}</CardTitle>
              <Button variant="destructive" size="icon" onClick={() => api.deleteOptionGroup(group.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {group.options.map((o: any) => (
                <div key={o.id} className="text-sm border-b py-1 flex justify-between">
                  <span>{o.name}</span>
                  <span className="font-bold">R$ {o.price.toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}