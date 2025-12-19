import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  Link,
} from '@tanstack/react-router';
import { Home, BarChart3, Menu, X } from 'lucide-react';
import React, { useState } from 'react';

import { HomePage } from '@/pages/HomePage';
import { QuizPage } from '@/pages/QuizPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { StatsPage } from '@/pages/StatsPage';

function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" icon={<Home className="h-4 w-4" />}>
                Accueil
              </NavLink>
              <NavLink to="/stats" icon={<BarChart3 className="h-4 w-4" />}>
                Statistiques
              </NavLink>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t animate-fade-in">
              <div className="flex flex-col gap-2">
                <MobileNavLink
                  to="/"
                  icon={<Home className="h-5 w-5" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accueil
                </MobileNavLink>
                <MobileNavLink
                  to="/stats"
                  icon={<BarChart3 className="h-5 w-5" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Statistiques
                </MobileNavLink>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                CiviTest — Simulateur d'entraînement pour l'Examen civique français
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                40 questions • 45 minutes • 80% requis pour réussir
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <div className="w-6 h-4 bg-[#002654] rounded-l" />
                <div className="w-6 h-4 bg-white border-y border-gray-200" />
                <div className="w-6 h-4 bg-[#CE1126] rounded-r" />
              </div>
              <span className="text-xs text-muted-foreground">
                République Française
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function NavLink({ to, children, icon }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      activeProps={{
        className: 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick?: () => void;
}

function MobileNavLink({ to, children, icon, onClick }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      activeProps={{
        className: 'bg-primary/10 text-primary',
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz',
  component: QuizPage,
});

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: StatsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  quizRoute,
  reviewRoute,
  statsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
