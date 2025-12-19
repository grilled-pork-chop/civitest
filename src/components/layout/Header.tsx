import { Link } from '@tanstack/react-router';
import { Home, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from '@/components/layout/NavLink';
import { MobileNavLink } from '@/components/layout/MobileNavLink';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm">
              <div className="absolute inset-0 flex">
                <div className="w-1/3 bg-[#002654]" />
                <div className="w-1/3 bg-white" />
                <div className="w-1/3 bg-[#CE1126]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[#002654] drop-shadow-sm">C</span>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-[#002654] group-hover:text-[#002654]/80 transition-colors">
                CiviTest
              </span>
              <span className="hidden sm:block text-xs text-muted-foreground">
                Préparation Examen Civique
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex gap-1">
            <NavLink to="/" icon={<Home className="h-4 w-4" />}>Accueil</NavLink>
            <NavLink to="/stats" icon={<BarChart3 className="h-4 w-4" />}>Statistiques</NavLink>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              Accueil
            </MobileNavLink>
            <MobileNavLink to="/stats" onClick={() => setMobileMenuOpen(false)}>
              Statistiques
            </MobileNavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
