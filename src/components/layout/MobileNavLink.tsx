import { Link } from '@tanstack/react-router';
import { type NavLinkProps } from '@/components/layout/NavLink';

export interface MobileNavLinkProps extends NavLinkProps {
  onClick?: () => void;
}

export function MobileNavLink({ to, children, icon, onClick }: MobileNavLinkProps) {
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
