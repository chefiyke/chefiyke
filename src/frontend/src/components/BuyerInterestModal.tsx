import { useActor } from "@caffeineai/core-infrastructure";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createActor } from "../backend";
import type { FormSource } from "../backend";
import { useContactDetails } from "../hooks/useContactDetails";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BuyerInterestModalProps {
  open: boolean;
  onClose: () => void;
  formSource: FormSource;
}

type Step = 1 | 2 | 3;

interface FormState {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  projectDescription: string;
  useCase: string;
  timeline: string;
  budgetRange: string;
  consent: boolean;
  honeypot: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  businessType: "",
  projectDescription: "",
  useCase: "",
  timeline: "",
  budgetRange: "",
  consent: false,
  honeypot: "",
};

// ─── Field component ─────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-body text-sm text-foreground/80">{label}</Label>
      {children}
      {error && (
        <p
          className="font-body text-xs text-destructive"
          data-ocid="buyer_modal.field_error"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {([1, 2, 3] as Step[]).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold transition-smooth"
            style={
              s === current
                ? {
                    background:
                      "linear-gradient(135deg, #C9A227 0%, #B8960C 100%)",
                    color: "#0a0a0a",
                    boxShadow: "0 0 12px rgba(184,150,12,0.35)",
                  }
                : s < current
                  ? {
                      background: "rgba(184,150,12,0.30)",
                      color: "#B8960C",
                      border: "1px solid rgba(184,150,12,0.45)",
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.35)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }
            }
          >
            {s < current ? "✓" : s}
          </div>
          {s < 3 && (
            <div
              className="w-10 h-px"
              style={{
                background:
                  s < current
                    ? "rgba(184,150,12,0.5)"
                    : "rgba(255,255,255,0.12)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Select wrapper ──────────────────────────────────────────────────────────
function GoldSelect({
  value,
  onChange,
  placeholder,
  options,
  "data-ocid": dataOcid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  "data-ocid"?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-ocid={dataOcid}
      className="w-full h-10 px-3 rounded-md font-body text-sm bg-card border border-border text-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200"
      style={{ appearance: "none" }}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BuyerInterestModal({
  open,
  onClose,
  formSource,
}: BuyerInterestModalProps) {
  const { actor } = useActor(createActor);
  const { data: contactDetails } = useContactDetails();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const clearErr = (field: keyof FormState) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  // ── Validation per step ───────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "A valid email address is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.businessName.trim())
      e.businessName = "Business or brand name is required.";
    if (!form.businessType)
      e.businessType = "Please select your business type.";
    if (!form.projectDescription.trim() || form.projectDescription.length < 20)
      e.projectDescription =
        "Please describe your project (at least 20 characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.timeline) e.timeline = "Please select a timeline.";
    if (!form.budgetRange) e.budgetRange = "Please select a budget range.";
    if (!form.consent) e.consent = "You must agree to proceed.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  function handleBack() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validateStep3()) return;
    if (!actor) {
      setSubmitError("Could not connect. Please try again.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const combined = [
        form.projectDescription,
        form.useCase ? `Use case: ${form.useCase}` : "",
      ]
        .join("\n")
        .trim();
      const result = await actor.submitBuyerLead(
        form.name,
        form.email,
        form.phone,
        form.businessName,
        form.businessType,
        combined,
        form.timeline,
        form.budgetRange,
        formSource,
        form.honeypot,
      );
      if (result.__kind__ === "ok") {
        setSubmitted(true);
      } else {
        setSubmitError(result.err || "Submission failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm(INITIAL_FORM);
      setErrors({});
      setSubmitted(false);
      setSubmitError(null);
    }, 350);
  }

  const whatsappMsg = encodeURIComponent(
    `Hi! I just submitted my interest for a landing page through chefiyke.com.\n\nName: ${form.name}\nBusiness: ${form.businessName}`,
  );
  const rawWhatsapp = contactDetails?.whatsapp ?? "";
  const whatsappBase = rawWhatsapp.startsWith("http")
    ? rawWhatsapp
    : rawWhatsapp
      ? `https://wa.me/${rawWhatsapp.replace(/\D/g, "")}`
      : "https://wa.me/2348000000000";
  const whatsappUrl = `${whatsappBase}?text=${whatsappMsg}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="buyer-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          data-ocid="buyer_modal.dialog"
        >
          <dialog
            open
            aria-label="Get your landing page"
            className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col p-0 m-0"
            style={{
              background: "linear-gradient(160deg, #141414 0%, #111 100%)",
              border: "1px solid rgba(184,150,12,0.20)",
              boxShadow:
                "0 0 40px rgba(184,150,12,0.08), 0 24px 48px rgba(0,0,0,0.6)",
              maxHeight: "92svh",
            }}
          >
            {/* Gold top accent */}
            <div
              className="h-[3px] w-full flex-shrink-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #B8960C 30%, #C9A227 70%, transparent)",
              }}
            />

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-3 flex-shrink-0">
              <div>
                <p className="font-body text-xs uppercase tracking-[0.18em] text-primary mb-0.5">
                  Premium Landing Page
                </p>
                <h2 className="font-display font-bold text-xl text-foreground leading-tight">
                  {submitted ? "Request Received!" : "Get Your Own Version"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                data-ocid="buyer_modal.close_button"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 pb-6">
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ─── Success screen ─── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center text-center gap-5 py-4"
                    data-ocid="buyer_modal.success_state"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(184,150,12,0.18) 0%, rgba(184,150,12,0.08) 100%)",
                        border: "1.5px solid rgba(184,150,12,0.40)",
                      }}
                    >
                      🎉
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground mb-2">
                        Thanks! Your request was received.
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        We'll reach out via WhatsApp shortly to discuss your
                        project.
                      </p>
                    </div>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid="buyer_modal.whatsapp_button"
                      className="flex items-center gap-3 w-full justify-center px-6 py-3.5 rounded-xl font-display font-semibold text-sm transition-smooth"
                      style={{
                        background:
                          "linear-gradient(135deg, #25D366 0%, #1DA851 100%)",
                        color: "#fff",
                        boxShadow:
                          "0 0 18px rgba(37,211,102,0.25), 0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 fill-current flex-shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Chat on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={handleClose}
                      data-ocid="buyer_modal.cancel_button"
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                    >
                      Close and return to page
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    <StepIndicator current={step} />

                    {/* Honeypot — invisible to real users */}
                    <input
                      type="text"
                      name="website"
                      value={form.honeypot}
                      onChange={(e) => set("honeypot", e.target.value)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
                      autoComplete="off"
                    />

                    {/* ── Step 1 ── */}
                    {step === 1 && (
                      <div
                        className="flex flex-col gap-4"
                        data-ocid="buyer_modal.step_1"
                      >
                        <p className="font-body text-sm text-muted-foreground -mt-2 mb-1">
                          Tell us about yourself so we can reach you.
                        </p>
                        <Field label="Full Name *" error={errors.name}>
                          <Input
                            value={form.name}
                            onChange={(e) => {
                              set("name", e.target.value);
                              clearErr("name");
                            }}
                            placeholder="Your full name"
                            data-ocid="buyer_modal.name_input"
                          />
                        </Field>
                        <Field label="Email Address *" error={errors.email}>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => {
                              set("email", e.target.value);
                              clearErr("email");
                            }}
                            placeholder="you@example.com"
                            data-ocid="buyer_modal.email_input"
                          />
                        </Field>
                        <Field
                          label="Phone / WhatsApp Number *"
                          error={errors.phone}
                        >
                          <Input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => {
                              set("phone", e.target.value);
                              clearErr("phone");
                            }}
                            placeholder="+234 800 000 0000"
                            data-ocid="buyer_modal.phone_input"
                          />
                        </Field>
                      </div>
                    )}

                    {/* ── Step 2 ── */}
                    {step === 2 && (
                      <div
                        className="flex flex-col gap-4"
                        data-ocid="buyer_modal.step_2"
                      >
                        <p className="font-body text-sm text-muted-foreground -mt-2 mb-1">
                          Help us understand your business and goals.
                        </p>
                        <Field
                          label="Business / Brand Name *"
                          error={errors.businessName}
                        >
                          <Input
                            value={form.businessName}
                            onChange={(e) => {
                              set("businessName", e.target.value);
                              clearErr("businessName");
                            }}
                            placeholder="e.g. Golden Bakery Ltd"
                            data-ocid="buyer_modal.business_name_input"
                          />
                        </Field>
                        <Field
                          label="Business Type *"
                          error={errors.businessType}
                        >
                          <GoldSelect
                            value={form.businessType}
                            onChange={(v) => {
                              set("businessType", v);
                              clearErr("businessType");
                            }}
                            placeholder="Select your business type"
                            data-ocid="buyer_modal.business_type_select"
                            options={[
                              {
                                value: "Food Business",
                                label: "Food Business",
                              },
                              { value: "Bakery", label: "Bakery" },
                              { value: "Consulting", label: "Consulting" },
                              { value: "Coaching", label: "Coaching" },
                              { value: "E-commerce", label: "E-commerce" },
                              { value: "Other", label: "Other" },
                            ]}
                          />
                        </Field>
                        <Field
                          label="Project Description *"
                          error={errors.projectDescription}
                        >
                          <textarea
                            value={form.projectDescription}
                            onChange={(e) => {
                              set("projectDescription", e.target.value);
                              clearErr("projectDescription");
                            }}
                            placeholder="Describe what you want your landing page to achieve..."
                            rows={3}
                            data-ocid="buyer_modal.project_description_textarea"
                            className="w-full px-3 py-2 rounded-md font-body text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors duration-200"
                          />
                        </Field>
                        <Field label="What do you want the page for?">
                          <Input
                            value={form.useCase}
                            onChange={(e) => set("useCase", e.target.value)}
                            placeholder="e.g. Attract clients, sell courses, showcase brand"
                            data-ocid="buyer_modal.use_case_input"
                          />
                        </Field>
                      </div>
                    )}

                    {/* ── Step 3 ── */}
                    {step === 3 && (
                      <div
                        className="flex flex-col gap-4"
                        data-ocid="buyer_modal.step_3"
                      >
                        <p className="font-body text-sm text-muted-foreground -mt-2 mb-1">
                          Almost done. Just a few final details.
                        </p>
                        <Field
                          label="Preferred Timeline *"
                          error={errors.timeline}
                        >
                          <GoldSelect
                            value={form.timeline}
                            onChange={(v) => {
                              set("timeline", v);
                              clearErr("timeline");
                            }}
                            placeholder="How soon do you need this?"
                            data-ocid="buyer_modal.timeline_select"
                            options={[
                              {
                                value: "ASAP",
                                label: "ASAP — as soon as possible",
                              },
                              { value: "1-2 weeks", label: "1–2 weeks" },
                              { value: "1 month", label: "Within 1 month" },
                              {
                                value: "Flexible",
                                label: "Flexible — no rush",
                              },
                            ]}
                          />
                        </Field>
                        <Field
                          label="Budget Range *"
                          error={errors.budgetRange}
                        >
                          <GoldSelect
                            value={form.budgetRange}
                            onChange={(v) => {
                              set("budgetRange", v);
                              clearErr("budgetRange");
                            }}
                            placeholder="What's your budget?"
                            data-ocid="buyer_modal.budget_select"
                            options={[
                              { value: "Under ₦50k", label: "Under ₦50,000" },
                              {
                                value: "₦50k-100k",
                                label: "₦50,000 – ₦100,000",
                              },
                              {
                                value: "₦100k-200k",
                                label: "₦100,000 – ₦200,000",
                              },
                              { value: "₦200k+", label: "₦200,000 and above" },
                            ]}
                          />
                        </Field>

                        {/* Offer summary */}
                        <div
                          className="rounded-xl p-4 text-sm font-body"
                          style={{
                            background: "rgba(184,150,12,0.06)",
                            border: "1px solid rgba(184,150,12,0.18)",
                          }}
                        >
                          <p className="font-display font-semibold text-primary mb-2">
                            What's included
                          </p>
                          <ul className="text-muted-foreground space-y-1 text-xs">
                            {[
                              "Premium mobile-first landing page",
                              "Fully customised for your brand",
                              "Conversion-focused design & copy",
                              "Admin panel with editable content",
                              "WhatsApp & contact integration",
                            ].map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="text-primary mt-0.5 flex-shrink-0">
                                  ✓
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Consent */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="consent-check"
                            checked={form.consent}
                            onChange={(e) => {
                              set("consent", e.target.checked);
                              clearErr("consent");
                            }}
                            data-ocid="buyer_modal.consent_checkbox"
                            className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0 cursor-pointer"
                          />
                          <label
                            htmlFor="consent-check"
                            className="font-body text-xs text-muted-foreground leading-relaxed cursor-pointer"
                          >
                            I agree to be contacted about my landing page
                            request via WhatsApp or email.
                          </label>
                        </div>
                        {errors.consent && (
                          <p
                            className="font-body text-xs text-destructive"
                            data-ocid="buyer_modal.consent_error"
                          >
                            {errors.consent}
                          </p>
                        )}

                        {submitError && (
                          <div
                            className="rounded-lg px-4 py-3 font-body text-sm text-destructive"
                            style={{
                              background: "rgba(220,38,38,0.08)",
                              border: "1px solid rgba(220,38,38,0.25)",
                            }}
                            data-ocid="buyer_modal.error_state"
                          >
                            {submitError}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Actions ── */}
                    <div className="flex items-center gap-3 mt-6">
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          data-ocid="buyer_modal.back_button"
                          className="flex-1 h-10 rounded-lg font-body text-sm text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Back
                        </button>
                      )}
                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          data-ocid="buyer_modal.next_button"
                          className="flex-1 h-10 rounded-lg font-display font-semibold text-sm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
                          style={{
                            background:
                              "linear-gradient(135deg, #C9A227 0%, #B8960C 100%)",
                            color: "#0a0a0a",
                            boxShadow: "0 0 14px rgba(184,150,12,0.20)",
                          }}
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          data-ocid="buyer_modal.submit_button"
                          className="flex-1 h-10 rounded-lg font-display font-semibold text-sm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: submitting
                              ? "rgba(184,150,12,0.30)"
                              : "linear-gradient(135deg, #C9A227 0%, #B8960C 100%)",
                            color: "#0a0a0a",
                            boxShadow: submitting
                              ? "none"
                              : "0 0 14px rgba(184,150,12,0.25)",
                          }}
                        >
                          {submitting ? "Submitting…" : "Submit Request"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
