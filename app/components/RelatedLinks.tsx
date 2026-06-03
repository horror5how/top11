import Link from "next/link";
import { relatedLinksFor, type LinkGroup } from "@/lib/relatedLinks";

function Group({ g }: { g: LinkGroup }) {
  const big = g.links.length > 14;
  const list = (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2">
      {g.links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-sm text-ink/60 hover:text-ink underline decoration-ink/15 hover:decoration-ink/50">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  if (big) {
    return (
      <details className="border-t border-ink/10 pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink/80 hover:text-ink select-none">
          {g.title} <span className="text-ink/40 font-normal">({g.links.length})</span>
        </summary>
        {list}
      </details>
    );
  }
  return (
    <div className="border-t border-ink/10 pt-3">
      <h3 className="text-sm font-semibold text-ink/80">{g.title}</h3>
      {list}
    </div>
  );
}

/** Internal-link mesh: links this list to all its question/slice pages so crawlers reach them in one hop. */
export default function RelatedLinks({ slug }: { slug: string }) {
  const groups = relatedLinksFor(slug);
  if (!groups.length) return null;
  return (
    <section className="mb-12 border-t border-ink/10 pt-10" aria-labelledby="explore-heading">
      <h2 id="explore-heading" className="text-2xl font-extrabold tracking-tight mb-1">Explore this category</h2>
      <p className="text-ink/55 mb-6 text-sm">Every angle on this ranking — by price, use case, integration, and head-to-head.</p>
      <div className="space-y-4">
        {groups.map((g) => (
          <Group key={g.title} g={g} />
        ))}
      </div>
    </section>
  );
}
