interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ breadcrumb, title, action }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                <span>{item}</span>
              </span>
            ))}
          </div>
          <h1 className="text-xl font-medium tracking-heading">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
