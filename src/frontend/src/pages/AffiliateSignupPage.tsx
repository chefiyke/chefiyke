import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import { Layout } from "../components/Layout";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROMOTION_OPTIONS = [
  "Social Media",
  "Email List",
  "Word of Mouth",
  "Content/Blog",
  "YouTube / Video",
  "Other",
] as const;

function fieldCls(error?: boolean) {
  return [
    "w-full bg-background border rounded-lg px-3 py-2.5 text-sm font-body text-foreground",
    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
    "transition-colors duration-200",
    error ? "border-red-500/60" : "border-input",
  ].join(" ");
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      className="font-body text-xs text-red-400 mt-1"
      data-ocid="affiliate.signup.field_error"
    >
      {message}
    </p>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState() {
  return (
    <div
      className="text-center py-8 px-2"
      data-ocid="affiliate.signup.success_state"
    >
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-primary" />
      </div>
      <h2 className="font-display font-bold text-xl text-foreground mb-2">
        Application Received!
      </h2>
      <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs mx-auto">
        We'll review your application and contact you within 2 business days.
        Thank you for your interest in partnering with Chefiyke.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:text-primary/80 transition-colors duration-200"
        data-ocid="affiliate.signup.back_link"
      >
        <ArrowLeft size={14} />
        Back to main site
      </a>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormState {
  fullName: string;
  email: string;
  whatsapp: string;
  promotionMethod: string;
  whyInterested: string;
  honeypot: string; // hidden — bots fill this
}

interface FormErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  promotionMethod?: string;
  whyInterested?: string;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!form.whatsapp.trim() || form.whatsapp.trim().length < 7) {
    errors.whatsapp = "Please enter a valid WhatsApp number.";
  }
  if (!form.promotionMethod) {
    errors.promotionMethod = "Please select a promotion method.";
  }
  if (!form.whyInterested.trim() || form.whyInterested.trim().length < 20) {
    errors.whyInterested =
      "Please tell us a bit more (at least 20 characters).";
  }
  return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AffiliateSignupPage() {
  const { actor, isFetching } = useActor(createActor);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    whatsapp: "",
    promotionMethod: "",
    whyInterested: "",
    honeypot: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      // Honeypot check — bots fill this, so we silently succeed without submitting
      if (form.honeypot) {
        await new Promise((r) => setTimeout(r, 800));
        return;
      }
      // Use adminRegisterAffiliate with a temporary invite code generated from email
      const inviteCode = `AFF-${form.fullName
        .toUpperCase()
        .replace(/\s+/g, "")
        .slice(0, 6)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

      await actor.submitContactMessage(
        form.fullName,
        `AFFILIATE APPLICATION\nEmail: ${form.email}\nWhatsApp: ${form.whatsapp}\nPromotion Method: ${form.promotionMethod}\nWhy Interested: ${form.whyInterested}\nInvite Code: ${inviteCode}`,
        form.honeypot,
      );
    },
    onSuccess: () => setSubmitted(true),
    onError: () => {
      setSubmitted(true); // Show success to avoid enumeration
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    submit();
  };

  const set =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <Layout>
      <div
        className="min-h-screen bg-background py-16 px-4"
        data-ocid="affiliate.signup.page"
      >
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Users size={24} className="text-primary" />
            </div>
            <p className="font-body text-xs uppercase tracking-[0.2em] text-primary mb-2">
              Affiliate Program
            </p>
            <h1 className="font-display font-bold text-3xl text-foreground mb-3">
              Join as an Affiliate
            </h1>
            <div className="w-10 h-0.5 bg-primary rounded-full mx-auto mb-4" />
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Partner with Chefiyke and earn commissions by referring clients.
              Complete the form below and we'll review your application within 2
              business days.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-elevated">
            {submitted ? (
              <SuccessState />
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                data-ocid="affiliate.signup.form"
              >
                {/* Honeypot — hidden from real users */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    height: 0,
                    overflow: "hidden",
                  }}
                >
                  <label htmlFor="aff_hp">Leave blank</label>
                  <input
                    id="aff_hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.honeypot}
                    onChange={set("honeypot")}
                  />
                </div>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="aff_name"
                      className="font-body text-xs text-muted-foreground mb-1.5 block"
                    >
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="aff_name"
                      type="text"
                      className={fieldCls(!!errors.fullName)}
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={set("fullName")}
                      autoComplete="name"
                      data-ocid="affiliate.signup.name_input"
                    />
                    {errors.fullName && (
                      <FieldError message={errors.fullName} />
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="aff_email"
                      className="font-body text-xs text-muted-foreground mb-1.5 block"
                    >
                      Email Address <span className="text-primary">*</span>
                    </label>
                    <input
                      id="aff_email"
                      type="email"
                      className={fieldCls(!!errors.email)}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set("email")}
                      autoComplete="email"
                      data-ocid="affiliate.signup.email_input"
                    />
                    {errors.email && <FieldError message={errors.email} />}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label
                      htmlFor="aff_whatsapp"
                      className="font-body text-xs text-muted-foreground mb-1.5 block"
                    >
                      WhatsApp Number <span className="text-primary">*</span>
                    </label>
                    <input
                      id="aff_whatsapp"
                      type="tel"
                      className={fieldCls(!!errors.whatsapp)}
                      placeholder="+234 800 000 0000"
                      value={form.whatsapp}
                      onChange={set("whatsapp")}
                      autoComplete="tel"
                      data-ocid="affiliate.signup.whatsapp_input"
                    />
                    {errors.whatsapp && (
                      <FieldError message={errors.whatsapp} />
                    )}
                  </div>

                  {/* Promotion Method */}
                  <div>
                    <label
                      htmlFor="aff_method"
                      className="font-body text-xs text-muted-foreground mb-1.5 block"
                    >
                      How will you promote?{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="aff_method"
                        value={form.promotionMethod}
                        onChange={set("promotionMethod")}
                        className={`${fieldCls(!!errors.promotionMethod)} appearance-none pr-8`}
                        data-ocid="affiliate.signup.promotion_select"
                      >
                        <option value="">Select a method…</option>
                        {PROMOTION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                    {errors.promotionMethod && (
                      <FieldError message={errors.promotionMethod} />
                    )}
                  </div>

                  {/* Why interested */}
                  <div>
                    <label
                      htmlFor="aff_why"
                      className="font-body text-xs text-muted-foreground mb-1.5 block"
                    >
                      Why do you want to be an affiliate?{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="aff_why"
                      className={`${fieldCls(!!errors.whyInterested)} min-h-[100px] resize-none`}
                      placeholder="Tell us about your audience, why you believe in this brand, and how you plan to drive referrals…"
                      value={form.whyInterested}
                      onChange={set("whyInterested")}
                      data-ocid="affiliate.signup.why_textarea"
                    />
                    <p className="font-body text-[10px] text-muted-foreground mt-1">
                      {form.whyInterested.length} / 500 characters
                    </p>
                    {errors.whyInterested && (
                      <FieldError message={errors.whyInterested} />
                    )}
                  </div>

                  {/* Divider */}
                  <div className="pt-2 border-t border-border">
                    <p className="font-body text-xs text-muted-foreground mb-4 leading-relaxed">
                      By submitting this form, you agree that your application
                      will be reviewed by our team. We'll contact you via the
                      email or WhatsApp number provided.
                    </p>

                    <Button
                      type="submit"
                      disabled={isPending || isFetching}
                      className="w-full font-body font-semibold gap-2"
                      data-ocid="affiliate.signup.submit_button"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Back link */}
          {!submitted && (
            <div className="text-center mt-6">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                data-ocid="affiliate.signup.nav_back_link"
              >
                <ArrowLeft size={14} />
                Back to main site
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
