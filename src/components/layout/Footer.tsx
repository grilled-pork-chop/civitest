import { BookOpen, ExternalLink, Scale } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gradient-to-b from-white to-slate-50 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Scale className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-bold text-foreground">
                CiviTest
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
              Simulateur d'entraînement pour l'Examen civique français. 
              Préparez-vous dans les conditions réelles.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">40</span> questions
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">45</span> minutes
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">80%</span> requis
              </span>
            </div>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Ressources officielles
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://formation-civique.interieur.gouv.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Formation Civique
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.service-public.fr/particuliers/vosdroits/F2213"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Service Public
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="text-center md:text-right">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              À propos
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto md:ml-auto md:mr-0">
              Outil non-officiel destiné uniquement à l'entraînement personnel.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Développé par Grilled Pork Chop
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-muted-foreground/60">
            © {currentYear} CiviTest. Projet open source.
          </p>
        </div>
      </div>
    </footer>
  );
}