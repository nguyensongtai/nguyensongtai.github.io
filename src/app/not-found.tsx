import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main id="main" className="shell flex min-h-dvh flex-col justify-center py-24">
      <p className="eyebrow text-muted">404 · page not found</p>
      <h1 className="mt-6 max-w-[16ch] text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
        This route didn&apos;t <span className="font-serif font-normal text-accent italic">render.</span>
      </h1>
      <div className="mt-10">
        <ButtonLink href="/" icon={<ArrowRight />}>
          Back to the portfolio
        </ButtonLink>
      </div>
    </main>
  );
}
