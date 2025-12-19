import { Link } from '@tanstack/react-router';

export interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function NavLink({ to, children, icon }: NavLinkProps) {
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