import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { ContactDetails } from "../../backend.d";
import { useRole } from "../../hooks/useRole";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

interface ContactForm {
  phone: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
  x: string;
  tiktok: string;
  linkedin: string;
  snapchat: string;
}

const EMPTY_FORM: ContactForm = {
  phone: "",
  whatsapp: "",
  email: "",
  facebook: "",
  instagram: "",
  x: "",
  tiktok: "",
  linkedin: "",
  snapchat: "",
};

function optVal(v: string | undefined): string {
  return v ?? "";
}

function optOrUndef(v: string): string | undefined {
  return v.trim() ? v.trim() : undefined;
}

export function AdminContactSettings() {
  const { isOwner } = useRole();
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [showPhone, setShowPhone] = useState(false);

  const { data: details, isLoading } = useQuery<ContactDetails>({
    queryKey: ["admin", "contactDetails"],
    queryFn: () => actor!.getContactDetails(),
    enabled,
  });

  useEffect(() => {
    if (details) {
      setForm({
        phone: optVal(details.phone),
        whatsapp: optVal(details.whatsapp),
        email: optVal(details.email),
        facebook: optVal(details.facebook),
        instagram: optVal(details.instagram),
        x: optVal(details.x),
        tiktok: optVal(details.tiktok),
        linkedin: optVal(details.linkedin),
        snapchat: optVal(details.snapchat),
      });
    }
  }, [details]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: ContactDetails = {
        phone: optOrUndef(form.phone),
        whatsapp: optOrUndef(form.whatsapp),
        email: optOrUndef(form.email),
        facebook: optOrUndef(form.facebook),
        instagram: optOrUndef(form.instagram),
        x: optOrUndef(form.x),
        tiktok: optOrUndef(form.tiktok),
        linkedin: optOrUndef(form.linkedin),
        snapchat: optOrUndef(form.snapchat),
        otherLinks: details?.otherLinks ?? [],
        updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      return actor!.adminSetContactDetails(payload);
    },
    onSuccess: (result) => {
      if (result.__kind__ === "ok") {
        toast.success("Contact details saved successfully");
        queryClient.invalidateQueries({
          queryKey: ["admin", "contactDetails"],
        });
        queryClient.invalidateQueries({ queryKey: ["contactDetails"] });
      } else {
        toast.error(`Failed to save: ${result.err}`);
      }
    },
    onError: () => toast.error("Failed to save contact details"),
  });

  const set = (k: keyof ContactForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  if (!isOwner) {
    return (
      <div
        className="bg-card border border-border rounded-xl p-8 text-center"
        data-ocid="admin.contact_settings.access_denied"
      >
        <p className="font-body text-sm text-muted-foreground">
          Contact settings are restricted to the Platform Owner.
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="admin.contact_settings.section">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Contact Settings"
          subtitle="Manage public-facing contact channels — changes reflect immediately on the site"
        />
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs shrink-0"
          data-ocid="admin.contact_settings.save_button"
        >
          <Save size={13} />
          {saveMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl p-8 text-center"
          data-ocid="admin.contact_settings.loading_state"
        >
          <p className="font-body text-sm text-muted-foreground">
            Loading contact details…
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Primary Channels */}
          <FormCard title="Primary Channels">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone with show/hide toggle */}
              <div>
                <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  Phone Number
                </span>
                <div className="relative">
                  <input
                    className={`${fieldClass()} pr-10`}
                    type={showPhone ? "text" : "password"}
                    placeholder="+234 xxx xxxx xxx"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    data-ocid="admin.contact_settings.phone_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhone((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPhone ? "Hide phone" : "Show phone"}
                  >
                    {showPhone ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  WhatsApp Number
                </span>
                <input
                  className={fieldClass()}
                  type="text"
                  placeholder="+234 xxx xxxx xxx"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  data-ocid="admin.contact_settings.whatsapp_input"
                />
              </div>
              <div>
                <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  Email Address
                </span>
                <input
                  className={fieldClass()}
                  type="email"
                  placeholder="hello@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  data-ocid="admin.contact_settings.email_input"
                />
              </div>
            </div>
          </FormCard>

          {/* Social Media */}
          <FormCard title="Social Media Profiles">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  {
                    key: "facebook",
                    label: "Facebook",
                    placeholder: "https://facebook.com/yourpage",
                  },
                  {
                    key: "instagram",
                    label: "Instagram",
                    placeholder: "https://instagram.com/yourhandle",
                  },
                  {
                    key: "x",
                    label: "X (Twitter)",
                    placeholder: "https://x.com/yourhandle",
                  },
                  {
                    key: "tiktok",
                    label: "TikTok",
                    placeholder: "https://tiktok.com/@yourhandle",
                  },
                  {
                    key: "linkedin",
                    label: "LinkedIn",
                    placeholder: "https://linkedin.com/in/yourprofile",
                  },
                  {
                    key: "snapchat",
                    label: "Snapchat",
                    placeholder: "https://snapchat.com/add/yourhandle",
                  },
                ] as {
                  key: keyof ContactForm;
                  label: string;
                  placeholder: string;
                }[]
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                    {label}
                  </span>
                  <input
                    className={fieldClass()}
                    type="url"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    data-ocid={`admin.contact_settings.${key}_input`}
                  />
                </div>
              ))}
            </div>
          </FormCard>

          {/* Save banner */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="admin.contact_settings.save_button_bottom"
            >
              <Save size={14} />
              {saveMutation.isPending ? "Saving…" : "Save All Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
