import { Link, Outlet } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Utensils, List, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar Fixa */}
      <aside className="w-64 border-r bg-card p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">SaaS Delivery</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/categories"><List className="h-4 w-4" /> Categorias</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/products"><Utensils className="h-4 w-4" /> Produtos</Link>
          </Button>
        </nav>

        <div className="pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {/* função de logout */}}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo Dinâmico */}
      <main className="flex-1 p-8">
        {/* O Outlet é onde as páginas (Dashboard, etc) vão aparecer */}
        <Outlet />
      </main>
    </div>
  );
}