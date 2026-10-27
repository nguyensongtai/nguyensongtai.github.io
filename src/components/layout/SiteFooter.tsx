import { profile } from "@/content/portfolio";
import { Signature } from "./Signature";
import { SignatureArt } from "./SignatureArt";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="shell flex flex-col gap-10 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-3 text-muted">Thanks for reading</p>
          <Signature name={profile.name}>
            <SignatureArt />
          </Signature>
          <p className="mt-2 font-mono text-[0.68rem] tracking-wide text-muted">
            {profile.name} · {profile.location.split(",")[0]} ·{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="space-y-2 text-[0.85rem] text-muted md:text-right">
          <p>
            Designed and built by me with Next.js, TypeScript, Tailwind CSS and Motion.{" "}
            <a href={profile.links.source} className="text-ink underline underline-offset-4 hover:text-accent">
              View source
            </a>
          </p>
          <p>
            © {new Date().getFullYear()} {profile.name} · {profile.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
