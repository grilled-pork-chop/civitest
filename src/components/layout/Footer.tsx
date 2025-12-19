export function Footer() {
  return (
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
  );
}
