import Breadcrumb from './Breadcrumb';

interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs: { name: string; href: string }[];
  byline?: string;
}

export default function PageHero({ title, description, breadcrumbs, byline }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <Breadcrumb items={breadcrumbs} />
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {byline && <p style={{ fontSize: '14px', marginTop: '8px', color: 'rgba(255,255,255,0.65)' }}>{byline}</p>}
      </div>
    </section>
  );
}
