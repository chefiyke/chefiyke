import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  AboutSection,
  ContactLinks,
  HelpBlock,
  HeroSlide,
  SignatureEdge,
  Testimonial,
} from "../../backend";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

// Extended CompetenceCard includes optional isVisible for toggle support
interface CompetenceCardExt {
  title: string;
  description: string;
  isVisible?: boolean;
}

// Extended Testimonial includes optional isVisible
interface TestimonialExt {
  author: string;
  role: string;
  text: string;
  isVisible?: boolean;
}

type ContentSection =
  | "tagline"
  | "hero"
  | "about"
  | "competence"
  | "testimonials"
  | "contact"
  | "helpblocks"
  | "signature";

function CollapsibleSection({
  title,
  ocid,
  children,
}: { title: string; ocid: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-border rounded-xl mb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        data-ocid={ocid}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-display font-semibold text-base text-foreground">
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>
      )}
    </div>
  );
}

// ─── Brand Tagline Editor ─────────────────────────────────────────────────────

function BrandTaglineEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const { data: savedTagline, isLoading: taglineLoading } = useQuery<string>({
    queryKey: ["admin", "brand-tagline"],
    queryFn: async () => {
      const extActor = actor as typeof actor & {
        adminGetBrandTagline?: () => Promise<string>;
      };
      if (typeof extActor.adminGetBrandTagline === "function") {
        return (await extActor.adminGetBrandTagline()) || "The King of Wealth";
      }
      // Fall back to public method
      const extActor2 = actor as typeof actor & {
        getBrandTagline?: () => Promise<string>;
      };
      if (typeof extActor2.getBrandTagline === "function") {
        return (await extActor2.getBrandTagline()) || "The King of Wealth";
      }
      return "The King of Wealth";
    },
    enabled,
  });

  // null = not yet edited; form waits for backend data before populating
  const [local, setLocal] = useState<string | null>(null);
  // Derive display value: local edit > backend value > loading placeholder
  const current = local ?? savedTagline ?? "";

  const mutation = useMutation({
    mutationFn: async (tagline: string) => {
      const extActor = actor as typeof actor & {
        adminSetBrandTagline?: (t: string) => Promise<void>;
      };
      if (typeof extActor.adminSetBrandTagline === "function") {
        await extActor.adminSetBrandTagline(tagline);
        return tagline;
      }
      throw new Error(
        "adminSetBrandTagline not yet available. Please update the backend.",
      );
    },
    onSuccess: (savedValue) => {
      toast.success("Brand tagline saved");
      // Optimistic: immediately show the saved value so form doesn't flicker
      setLocal(savedValue);
      qc.invalidateQueries({ queryKey: ["admin", "brand-tagline"] });
      qc.invalidateQueries({ queryKey: ["brandTagline"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to save tagline"),
  });

  // Once the query re-fetches and returns fresh data, clear local so we track
  // the server state again (unless the user has made further edits)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional sync
  useEffect(() => {
    if (savedTagline !== undefined && local !== null && !mutation.isPending) {
      // Only clear local if it matches what just came back from backend
      if (local === savedTagline) setLocal(null);
    }
  }, [savedTagline]);

  return (
    <div className="space-y-3">
      <p className="font-body text-xs text-muted-foreground">
        This text appears below the hero headline on Slide 1. Default: "The King
        of Wealth"
      </p>
      {taglineLoading ? (
        <div className="h-10 rounded-lg bg-muted animate-pulse" />
      ) : (
        <input
          className={fieldClass()}
          placeholder="Brand tagline (e.g. The King of Wealth)"
          value={current}
          onChange={(e) => setLocal(e.target.value)}
          data-ocid="admin.tagline.input"
        />
      )}
      <Button
        onClick={() => mutation.mutate(current)}
        disabled={mutation.isPending || taglineLoading}
        data-ocid="admin.tagline.save_button"
      >
        <Save size={14} className="mr-1" />
        {mutation.isPending ? "Saving…" : "Save Tagline"}
      </Button>
    </div>
  );
}

// ─── Hero Editor ─────────────────────────────────────────────────────────────

function HeroEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const { data: slides, isLoading: slidesLoading } = useQuery<HeroSlide[]>({
    // No placeholderData — form must wait for real backend data
    queryKey: ["admin", "hero-slides"],
    queryFn: async () => {
      const fetched = await actor!.getHeroSlides();
      // If backend returns empty slides (first deploy), seed with required defaults
      if (!fetched || fetched.length === 0) {
        return [
          {
            headline: "Most people have ideas. Very few build systems.",
            subheadline: "",
            body: "I help people and businesses turn scattered ideas into structured systems, premium digital experiences, stronger brands, and measurable results.",
            button1: { text: "Work With Me", href: "#how-i-help" },
            button2: { text: "Explore My Systems", href: "/systems" },
          },
          {
            headline:
              "If your business isn't converting, something is missing.",
            subheadline: "",
            body: "Traffic, effort, and ideas mean nothing without structure. I build systems that help businesses attract attention, gain trust, and convert consistently.",
            button1: { text: "Get This Landing Page", href: "#pricing" },
            button2: { text: "Work With Me", href: "#how-i-help" },
          },
          {
            headline: "What you're building deserves structure.",
            subheadline: "",
            body: "From premium landing pages to backend-controlled platforms, I create systems designed to scale, perform, and stay in control.",
            button1: { text: "See How I Help", href: "#how-i-help" },
            button2: { text: "Explore My Systems", href: "/systems" },
          },
        ] as HeroSlide[];
      }
      return fetched;
    },
    enabled: !!actor && !isFetching,
  });
  const [local, setLocal] = useState<HeroSlide[] | null>(null);
  // Use local edits if present, fall back to backend data, never to an empty
  // array that would make the form look blank
  const current = local ?? slides ?? [];

  const mutation = useMutation({
    mutationFn: (s: HeroSlide[]) => actor!.adminSetHeroSlides(s),
    onSuccess: (_data, savedSlides) => {
      toast.success("Hero slides saved");
      // Optimistic: keep the saved values in local state so form doesn't flicker
      setLocal(savedSlides);
      qc.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
    },
    onError: () => toast.error("Failed to save hero slides"),
  });

  const update = (i: number, field: keyof HeroSlide | string, val: string) => {
    const arr = current.map((s, idx) => {
      if (idx !== i) return s;
      if (field === "headline") return { ...s, headline: val };
      if (field === "subheadline") return { ...s, subheadline: val };
      if (field === "body") return { ...s, body: val };
      if (field === "btn1text")
        return { ...s, button1: { ...s.button1, text: val } };
      if (field === "btn1href")
        return { ...s, button1: { ...s.button1, href: val } };
      if (field === "btn2text")
        return { ...s, button2: { ...s.button2, text: val } };
      if (field === "btn2href")
        return { ...s, button2: { ...s.button2, href: val } };
      return s;
    });
    setLocal(arr);
  };

  if (slidesLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-48 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {current.map((slide, i) => (
        <div
          key={`slide-${slide.headline || i}`}
          className="border border-border rounded-lg p-4 space-y-3"
        >
          <p className="font-body text-xs text-primary font-semibold uppercase tracking-widest">
            Slide {i + 1}
          </p>
          <input
            className={fieldClass()}
            placeholder="Headline"
            value={slide.headline}
            onChange={(e) => update(i, "headline", e.target.value)}
            data-ocid={`admin.hero.headline.${i + 1}`}
          />
          <input
            className={fieldClass()}
            placeholder="Subheadline"
            value={slide.subheadline}
            onChange={(e) => update(i, "subheadline", e.target.value)}
            data-ocid={`admin.hero.subheadline.${i + 1}`}
          />
          <textarea
            className={`${fieldClass()} min-h-[80px] resize-y`}
            placeholder="Body text"
            value={slide.body}
            onChange={(e) => update(i, "body", e.target.value)}
            data-ocid={`admin.hero.body.${i + 1}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className={fieldClass()}
              placeholder="Button 1 text"
              value={slide.button1.text}
              onChange={(e) => update(i, "btn1text", e.target.value)}
            />
            <input
              className={fieldClass()}
              placeholder="Button 1 href"
              value={slide.button1.href}
              onChange={(e) => update(i, "btn1href", e.target.value)}
            />
            <input
              className={fieldClass()}
              placeholder="Button 2 text"
              value={slide.button2.text}
              onChange={(e) => update(i, "btn2text", e.target.value)}
            />
            <input
              className={fieldClass()}
              placeholder="Button 2 href"
              value={slide.button2.href}
              onChange={(e) => update(i, "btn2href", e.target.value)}
            />
          </div>
        </div>
      ))}
      <Button
        onClick={() => mutation.mutate(current)}
        disabled={mutation.isPending}
        data-ocid="admin.hero.save_button"
      >
        <Save size={14} className="mr-1" />{" "}
        {mutation.isPending ? "Saving…" : "Save Slides"}
      </Button>
    </div>
  );
}

// ─── About Editor ─────────────────────────────────────────────────────────────

function AboutEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<AboutSection>({
    queryKey: ["admin", "about"],
    queryFn: () => actor!.getAbout(),
    enabled: !!actor && !isFetching,
  });
  const [local, setLocal] = useState<AboutSection | null>(null);
  // Only fall back to empty strings while loading — never hardcode defaults
  const current = local ?? data ?? { bio: "", title: "" };
  const mutation = useMutation({
    mutationFn: (a: AboutSection) => actor!.adminSetAbout(a),
    onSuccess: (_data, savedAbout) => {
      toast.success("About section saved");
      setLocal(savedAbout); // optimistic: show saved value immediately
      qc.invalidateQueries({ queryKey: ["admin", "about"] });
    },
    onError: () => toast.error("Failed to save"),
  });
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <input
        className={fieldClass()}
        placeholder="Title / tagline"
        value={current.title}
        onChange={(e) => setLocal({ ...current, title: e.target.value })}
        data-ocid="admin.about.title_input"
      />
      <textarea
        className={`${fieldClass()} min-h-[120px] resize-y`}
        placeholder="Bio"
        value={current.bio}
        onChange={(e) => setLocal({ ...current, bio: e.target.value })}
        data-ocid="admin.about.bio_input"
      />
      <Button
        onClick={() => mutation.mutate(current)}
        disabled={mutation.isPending}
        data-ocid="admin.about.save_button"
      >
        <Save size={14} className="mr-1" />{" "}
        {mutation.isPending ? "Saving…" : "Save About"}
      </Button>
    </div>
  );
}

// ─── Competence Editor ────────────────────────────────────────────────────────

function CompetenceEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  // Section-level visibility toggle
  const { data: sectionVisible = true } = useQuery<boolean>({
    queryKey: ["admin", "competence-section-visible"],
    queryFn: async () => {
      const extActor = actor as typeof actor & {
        adminGetCompetenceSectionVisible?: () => Promise<boolean>;
        getCompetenceSectionVisible?: () => Promise<boolean>;
      };
      if (typeof extActor.adminGetCompetenceSectionVisible === "function")
        return extActor.adminGetCompetenceSectionVisible();
      if (typeof extActor.getCompetenceSectionVisible === "function")
        return extActor.getCompetenceSectionVisible();
      return true;
    },
    enabled,
  });

  const sectionToggleMutation = useMutation({
    mutationFn: async (visible: boolean) => {
      const extActor = actor as typeof actor & {
        adminSetCompetenceSectionVisible?: (v: boolean) => Promise<void>;
      };
      if (typeof extActor.adminSetCompetenceSectionVisible === "function") {
        await extActor.adminSetCompetenceSectionVisible(visible);
        return visible;
      }
      throw new Error(
        "adminSetCompetenceSectionVisible not yet available on backend.",
      );
    },
    onSuccess: (_data, visible) => {
      toast.success(
        `Competence section ${visible ? "shown" : "hidden"} on frontend`,
      );
      qc.invalidateQueries({
        queryKey: ["admin", "competence-section-visible"],
      });
      qc.invalidateQueries({ queryKey: ["competenceSectionVisible"] });
    },
    onError: (err: Error) => toast.error(err.message || "Toggle failed"),
  });

  // Card-level editing with isVisible
  const { data, isLoading: cardsLoading } = useQuery<CompetenceCardExt[]>({
    queryKey: ["admin", "competence"],
    queryFn: () => actor!.getCompetenceCards() as Promise<CompetenceCardExt[]>,
    enabled,
  });
  const [local, setLocal] = useState<CompetenceCardExt[] | null>(null);
  const current = local ?? data ?? [];

  const mutation = useMutation({
    mutationFn: (c: CompetenceCardExt[]) =>
      actor!.adminSetCompetenceCards(
        c.map((card) => ({
          title: card.title,
          description: card.description,
          isVisible: card.isVisible ?? true,
        })),
      ),
    onSuccess: (_data, savedCards) => {
      toast.success("Competence cards saved");
      setLocal(savedCards); // optimistic
      qc.invalidateQueries({ queryKey: ["admin", "competence"] });
      qc.invalidateQueries({ queryKey: ["competenceCards"] });
      qc.invalidateQueries({ queryKey: ["competenceCardsVisible"] });
    },
    onError: () => toast.error("Failed to save"),
  });

  const update = (
    i: number,
    field: "title" | "description" | "isVisible",
    val: string | boolean,
  ) =>
    setLocal(current.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  const add = () =>
    setLocal([...current, { title: "", description: "", isVisible: true }]);
  const remove = (i: number) => setLocal(current.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {/* Section-level toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
        <div>
          <p className="font-body text-sm font-semibold text-foreground">
            Competence Section Visible
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Toggle the entire Competence section ON or OFF on the public site
          </p>
        </div>
        <button
          type="button"
          onClick={() => sectionToggleMutation.mutate(!sectionVisible)}
          disabled={sectionToggleMutation.isPending}
          data-ocid="admin.competence.section_toggle"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-colors disabled:opacity-50"
          style={{
            background: sectionVisible
              ? "rgba(184,150,12,0.15)"
              : "rgba(100,100,100,0.15)",
            border: `1px solid ${
              sectionVisible
                ? "rgba(184,150,12,0.50)"
                : "rgba(100,100,100,0.30)"
            }`,
            color: sectionVisible ? "#B8960C" : "#888",
          }}
        >
          {sectionVisible ? (
            <>
              <Eye size={13} /> ON
            </>
          ) : (
            <>
              <EyeOff size={13} /> OFF
            </>
          )}
        </button>
      </div>

      {/* Per-card editors */}
      {cardsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {current.map((card, i) => (
            <div
              key={`card-${card.title || i}`}
              className="flex gap-2 items-start"
              data-ocid={`admin.competence.item.${i + 1}`}
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  className={fieldClass()}
                  placeholder="Title"
                  value={card.title}
                  onChange={(e) => update(i, "title", e.target.value)}
                />
                <input
                  className={fieldClass()}
                  placeholder="Description"
                  value={card.description}
                  onChange={(e) => update(i, "description", e.target.value)}
                />
              </div>
              {/* Per-item visibility toggle */}
              <button
                type="button"
                onClick={() =>
                  update(i, "isVisible", !(card.isVisible ?? true))
                }
                className="mt-2 p-1.5 rounded transition-colors"
                style={{
                  color:
                    (card.isVisible ?? true)
                      ? "#B8960C"
                      : "rgba(150,150,150,0.7)",
                }}
                aria-label={
                  (card.isVisible ?? true) ? "Hide card" : "Show card"
                }
                title={(card.isVisible ?? true) ? "Visible" : "Hidden"}
              >
                {(card.isVisible ?? true) ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} />
                )}
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive mt-2"
                aria-label="Remove card"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={add}
          size="sm"
          data-ocid="admin.competence.add_button"
        >
          <Plus size={13} className="mr-1" /> Add Card
        </Button>
        <Button
          onClick={() => mutation.mutate(current)}
          disabled={mutation.isPending}
          data-ocid="admin.competence.save_button"
        >
          <Save size={14} className="mr-1" />{" "}
          {mutation.isPending ? "Saving…" : "Save Cards"}
        </Button>
      </div>
    </div>
  );
}

// ─── Testimonials Editor ──────────────────────────────────────────────────────

function TestimonialsEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<TestimonialExt[]>({
    queryKey: ["admin", "testimonials"],
    queryFn: () => actor!.getTestimonials() as Promise<TestimonialExt[]>,
    enabled: !!actor && !isFetching,
  });
  const [local, setLocal] = useState<TestimonialExt[] | null>(null);
  const current = local ?? data ?? [];
  const mutation = useMutation({
    mutationFn: (t: TestimonialExt[]) =>
      actor!.adminSetTestimonials(
        t.map((item) => ({
          author: item.author,
          role: item.role,
          text: item.text,
          isVisible: item.isVisible ?? true,
        })) as Testimonial[],
      ),
    onSuccess: (_data, savedTestimonials) => {
      toast.success("Testimonials saved");
      setLocal(savedTestimonials); // optimistic
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      qc.invalidateQueries({ queryKey: ["testimonials"] });
    },
    onError: () => toast.error("Failed to save"),
  });
  const update = (
    i: number,
    field: keyof TestimonialExt,
    val: string | boolean,
  ) =>
    setLocal(current.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));
  const add = () =>
    setLocal([...current, { author: "", role: "", text: "", isVisible: true }]);
  const remove = (i: number) => setLocal(current.filter((_, idx) => idx !== i));
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <div key={n} className="h-28 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {current.map((t, i) => (
        <div
          key={`testimonial-${t.author || i}`}
          className="border border-border rounded-lg p-3 space-y-2"
          data-ocid={`admin.testimonials.item.${i + 1}`}
        >
          <div className="flex gap-2 items-start">
            <div className="flex-1 flex gap-2">
              <input
                className={fieldClass()}
                placeholder="Author name"
                value={t.author}
                onChange={(e) => update(i, "author", e.target.value)}
              />
              <input
                className={fieldClass()}
                placeholder="Role/Title"
                value={t.role}
                onChange={(e) => update(i, "role", e.target.value)}
              />
            </div>
            {/* Visibility toggle */}
            <button
              type="button"
              onClick={() => update(i, "isVisible", !(t.isVisible ?? true))}
              className="p-1.5 rounded transition-colors"
              style={{
                color:
                  (t.isVisible ?? true) ? "#B8960C" : "rgba(150,150,150,0.7)",
              }}
              aria-label={
                (t.isVisible ?? true) ? "Hide testimonial" : "Show testimonial"
              }
              title={(t.isVisible ?? true) ? "Visible" : "Hidden"}
            >
              {(t.isVisible ?? true) ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove testimonial"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <textarea
            className={`${fieldClass()} min-h-[70px] resize-y`}
            placeholder="Testimonial text"
            value={t.text}
            onChange={(e) => update(i, "text", e.target.value)}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={add}
          size="sm"
          data-ocid="admin.testimonials.add_button"
        >
          <Plus size={13} className="mr-1" /> Add
        </Button>
        <Button
          onClick={() => mutation.mutate(current)}
          disabled={mutation.isPending}
          data-ocid="admin.testimonials.save_button"
        >
          <Save size={14} className="mr-1" />{" "}
          {mutation.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ─── Contact Links Editor ─────────────────────────────────────────────────────

function ContactLinksEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<ContactLinks>({
    queryKey: ["admin", "contact-links"],
    queryFn: () => actor!.adminGetContactLinks(),
    enabled: !!actor && !isFetching,
  });
  const [local, setLocal] = useState<ContactLinks | null>(null);
  const current = local ??
    data ?? {
      whatsapp: "",
      facebook: "",
      instagram: "",
      email: "",
      primaryCtaText: "",
    };
  const set = (field: keyof ContactLinks, val: string) =>
    setLocal({ ...current, [field]: val });
  const mutation = useMutation({
    mutationFn: (l: ContactLinks) => actor!.adminSetContactLinks(l),
    onSuccess: (_data, savedLinks) => {
      toast.success("Contact links saved");
      setLocal(savedLinks); // optimistic
      qc.invalidateQueries({ queryKey: ["admin", "contact-links"] });
    },
    onError: () => toast.error("Failed to save"),
  });
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-10 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <input
        className={fieldClass()}
        placeholder="Primary CTA Text"
        value={current.primaryCtaText}
        onChange={(e) => set("primaryCtaText", e.target.value)}
        data-ocid="admin.contact.cta_input"
      />
      <input
        className={fieldClass()}
        placeholder="WhatsApp URL"
        value={current.whatsapp}
        onChange={(e) => set("whatsapp", e.target.value)}
        data-ocid="admin.contact.whatsapp_input"
      />
      <input
        className={fieldClass()}
        placeholder="Facebook URL"
        value={current.facebook}
        onChange={(e) => set("facebook", e.target.value)}
        data-ocid="admin.contact.facebook_input"
      />
      <input
        className={fieldClass()}
        placeholder="Instagram URL"
        value={current.instagram}
        onChange={(e) => set("instagram", e.target.value)}
        data-ocid="admin.contact.instagram_input"
      />
      <input
        className={fieldClass()}
        placeholder="Email address"
        value={current.email}
        onChange={(e) => set("email", e.target.value)}
        data-ocid="admin.contact.email_input"
      />
      <Button
        onClick={() => mutation.mutate(current)}
        disabled={mutation.isPending}
        data-ocid="admin.contact.save_button"
      >
        <Save size={14} className="mr-1" />{" "}
        {mutation.isPending ? "Saving…" : "Save Contact Links"}
      </Button>
    </div>
  );
}

// ─── Help Blocks Editor ───────────────────────────────────────────────────────

function HelpBlocksEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<HelpBlock[]>({
    queryKey: ["admin", "helpblocks"],
    queryFn: () => actor!.getHelpBlocks(),
    enabled: !!actor && !isFetching,
  });
  const [local, setLocal] = useState<HelpBlock[] | null>(null);
  const current = local ?? data ?? [];
  const mutation = useMutation({
    mutationFn: (b: HelpBlock[]) => actor!.adminSetHelpBlocks(b),
    onSuccess: (_data, savedBlocks) => {
      toast.success("Help blocks saved");
      setLocal(savedBlocks); // optimistic
      qc.invalidateQueries({ queryKey: ["admin", "helpblocks"] });
    },
    onError: () => toast.error("Failed to save"),
  });
  const update = (i: number, field: "title" | "description", val: string) =>
    setLocal(current.map((b, idx) => (idx === i ? { ...b, [field]: val } : b)));
  const add = () => setLocal([...current, { title: "", description: "" }]);
  const remove = (i: number) => setLocal(current.filter((_, idx) => idx !== i));
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <div key={n} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {current.map((b, i) => (
        <div
          key={`hb-${b.title || i}`}
          className="flex gap-2 items-start"
          data-ocid={`admin.help.item.${i + 1}`}
        >
          <div className="flex-1 space-y-2">
            <input
              className={fieldClass()}
              placeholder="Title"
              value={b.title}
              onChange={(e) => update(i, "title", e.target.value)}
            />
            <input
              className={fieldClass()}
              placeholder="Description"
              value={b.description}
              onChange={(e) => update(i, "description", e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted-foreground hover:text-destructive mt-2"
            aria-label="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={add}
          size="sm"
          data-ocid="admin.help.add_button"
        >
          <Plus size={13} className="mr-1" /> Add
        </Button>
        <Button
          onClick={() => mutation.mutate(current)}
          disabled={mutation.isPending}
          data-ocid="admin.help.save_button"
        >
          <Save size={14} className="mr-1" />{" "}
          {mutation.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ─── Signature Edge Editor ────────────────────────────────────────────────────

function SignatureEdgeEditor() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<SignatureEdge>({
    queryKey: ["admin", "signature"],
    queryFn: () => actor!.getSignatureEdge(),
    enabled: !!actor && !isFetching,
  });
  const [local, setLocal] = useState<SignatureEdge | null>(null);
  const current = local ??
    data ?? { quote: "", pillar1: "", pillar2: "", pillar3: "" };
  const set = (field: keyof SignatureEdge, val: string) =>
    setLocal({ ...current, [field]: val });
  const mutation = useMutation({
    mutationFn: (s: SignatureEdge) => actor!.adminSetSignatureEdge(s),
    onSuccess: (_data, savedSig) => {
      toast.success("Signature edge saved");
      setLocal(savedSig); // optimistic
      qc.invalidateQueries({ queryKey: ["admin", "signature"] });
    },
    onError: () => toast.error("Failed to save"),
  });
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <textarea
        className={`${fieldClass()} min-h-[80px] resize-y`}
        placeholder="Core quote"
        value={current.quote}
        onChange={(e) => set("quote", e.target.value)}
        data-ocid="admin.signature.quote_input"
      />
      <input
        className={fieldClass()}
        placeholder="Pillar 1"
        value={current.pillar1}
        onChange={(e) => set("pillar1", e.target.value)}
        data-ocid="admin.signature.pillar1_input"
      />
      <input
        className={fieldClass()}
        placeholder="Pillar 2"
        value={current.pillar2}
        onChange={(e) => set("pillar2", e.target.value)}
        data-ocid="admin.signature.pillar2_input"
      />
      <input
        className={fieldClass()}
        placeholder="Pillar 3"
        value={current.pillar3}
        onChange={(e) => set("pillar3", e.target.value)}
        data-ocid="admin.signature.pillar3_input"
      />
      <Button
        onClick={() => mutation.mutate(current)}
        disabled={mutation.isPending}
        data-ocid="admin.signature.save_button"
      >
        <Save size={14} className="mr-1" />{" "}
        {mutation.isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

const SECTION_LABELS: { id: ContentSection; label: string }[] = [
  { id: "tagline", label: "Brand Tagline" },
  { id: "hero", label: "Hero Slides" },
  { id: "about", label: "About Section" },
  { id: "competence", label: "Competence Cards" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact Links" },
  { id: "helpblocks", label: "How I Help Blocks" },
  { id: "signature", label: "Signature Edge" },
];

export function AdminContentEditor() {
  return (
    <div data-ocid="admin.content.section">
      <SectionHeader
        title="Content Editor"
        subtitle="Edit all sections of the public site"
      />
      {SECTION_LABELS.map(({ id, label }) => (
        <CollapsibleSection
          key={id}
          title={label}
          ocid={`admin.content.${id}_toggle`}
        >
          {id === "tagline" && <BrandTaglineEditor />}
          {id === "hero" && <HeroEditor />}
          {id === "about" && <AboutEditor />}
          {id === "competence" && <CompetenceEditor />}
          {id === "testimonials" && <TestimonialsEditor />}
          {id === "contact" && <ContactLinksEditor />}
          {id === "helpblocks" && <HelpBlocksEditor />}
          {id === "signature" && <SignatureEdgeEditor />}
        </CollapsibleSection>
      ))}
    </div>
  );
}
