import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  Gift,
  Package,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  Bundle,
  CompetencePricing,
  ConsultancyService,
  GiveawayItem,
  LandingPageOffer,
  PricingData,
} from "../../backend.d";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

type PricingTab =
  | "landing"
  | "consultancy"
  | "competence"
  | "bundles"
  | "giveaways";

const TABS: { id: PricingTab; label: string; icon: React.ReactNode }[] = [
  { id: "landing", label: "Landing Page Offers", icon: <Tag size={15} /> },
  {
    id: "consultancy",
    label: "Consultancy Services",
    icon: <DollarSign size={15} />,
  },
  {
    id: "competence",
    label: "Competence Pricing",
    icon: <Package size={15} />,
  },
  { id: "bundles", label: "Bundles", icon: <Package size={15} /> },
  { id: "giveaways", label: "Giveaways", icon: <Gift size={15} /> },
];

function VisibilityToggle({
  isVisible,
  onToggle,
  loading,
}: { isVisible: boolean; onToggle: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      title={isVisible ? "Visible — click to hide" : "Hidden — click to show"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold border transition-colors ${
        isVisible
          ? "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25"
          : "bg-muted border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
      }`}
    >
      {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
      {isVisible ? "ON" : "OFF"}
    </button>
  );
}

// ── Landing Page Offers ──────────────────────────────────────────────────────

function LandingOffersPanel({
  offers,
  actor,
  queryClient,
}: {
  offers: LandingPageOffer[];
  actor: ReturnType<typeof createActor>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LandingPageOffer>>({});
  const [addMode, setAddMode] = useState(false);
  const [newForm, setNewForm] = useState<Omit<LandingPageOffer, "id">>({
    tier: "",
    title: "",
    description: "",
    price: 0n,
    currency: "NGN",
    isVisible: true,
    tag: undefined,
  });

  const saveMut = useMutation({
    mutationFn: (updated: LandingPageOffer[]) =>
      actor!.adminSetLandingPageOffers(updated),
    onSuccess: () => {
      toast.success("Landing page offers saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
      setEditId(null);
    },
    onError: () => toast.error("Failed to save offers"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) =>
      actor!.adminTogglePricingItemVisibility("landingPage", id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] }),
    onError: () => toast.error("Toggle failed"),
  });

  function startEdit(offer: LandingPageOffer) {
    setEditId(offer.id);
    setEditForm({ ...offer });
  }

  function saveEdit() {
    const updated = offers.map((o) =>
      o.id === editId ? { ...o, ...editForm } : o,
    );
    saveMut.mutate(updated);
  }

  function addOffer() {
    const id = `offer_${Date.now()}`;
    saveMut.mutate([...offers, { id, ...newForm }]);
    setAddMode(false);
    setNewForm({
      tier: "",
      title: "",
      description: "",
      price: 0n,
      currency: "NGN",
      isVisible: true,
      tag: undefined,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          Manage your landing page pricing tiers shown to prospects.
        </p>
        <Button
          size="sm"
          onClick={() => setAddMode(true)}
          className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          data-ocid="admin.pricing.landing.add_button"
        >
          <Plus size={13} /> Add Tier
        </Button>
      </div>

      {addMode && (
        <FormCard title="New Landing Page Tier">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Tier Key
              </span>
              <input
                className={fieldClass()}
                placeholder="e.g. base, premium"
                value={newForm.tier}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, tier: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Title
              </span>
              <input
                className={fieldClass()}
                placeholder="Offer title"
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Description
              </span>
              <textarea
                className={`${fieldClass()} resize-none h-20`}
                placeholder="Describe this tier..."
                value={newForm.description}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Price (NGN)
              </span>
              <input
                className={fieldClass()}
                type="number"
                placeholder="0"
                value={Number(newForm.price)}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    price: BigInt(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Currency
              </span>
              <input
                className={fieldClass()}
                placeholder="NGN"
                value={newForm.currency}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, currency: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addOffer}
              disabled={saveMut.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              data-ocid="admin.pricing.landing.save_button"
            >
              <Save size={13} /> Save Tier
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddMode(false)}
              className="gap-1.5 text-xs"
              data-ocid="admin.pricing.landing.cancel_button"
            >
              <X size={13} /> Cancel
            </Button>
          </div>
        </FormCard>
      )}

      <div className="space-y-3">
        {offers.length === 0 && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.pricing.landing.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No landing page offers yet. Add your first tier.
            </p>
          </div>
        )}
        {offers.map((offer, i) => (
          <div
            key={offer.id}
            className="bg-card border border-border rounded-xl p-4"
            data-ocid={`admin.pricing.landing.item.${i + 1}`}
          >
            {editId === offer.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Tier Key
                    </span>
                    <input
                      className={fieldClass()}
                      value={String(editForm.tier ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, tier: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Title
                    </span>
                    <input
                      className={fieldClass()}
                      value={String(editForm.title ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Description
                    </span>
                    <textarea
                      className={`${fieldClass()} resize-none h-20`}
                      value={String(editForm.description ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Price (NGN)
                    </span>
                    <input
                      className={fieldClass()}
                      type="number"
                      value={Number(editForm.price ?? 0)}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          price: BigInt(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={saveEdit}
                    disabled={saveMut.isPending}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    data-ocid={`admin.pricing.landing.save_button.${i + 1}`}
                  >
                    <Save size={12} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditId(null)}
                    className="gap-1.5 text-xs"
                    data-ocid={`admin.pricing.landing.cancel_button.${i + 1}`}
                  >
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">
                      {offer.tier}
                    </span>
                    <span className="font-display font-semibold text-foreground text-sm">
                      {offer.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {offer.description}
                  </p>
                  <p className="font-display font-bold text-primary text-lg">
                    {offer.currency} {Number(offer.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VisibilityToggle
                    isVisible={offer.isVisible}
                    onToggle={() => toggleMut.mutate(offer.id)}
                    loading={toggleMut.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => startEdit(offer)}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    data-ocid={`admin.pricing.landing.edit_button.${i + 1}`}
                    aria-label="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Consultancy Services ─────────────────────────────────────────────────────

function ConsultancyPanel({
  services,
  actor,
  queryClient,
}: {
  services: ConsultancyService[];
  actor: ReturnType<typeof createActor>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ConsultancyService>>({});
  const [addMode, setAddMode] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "NGN",
  });

  const saveMut = useMutation({
    mutationFn: (updated: ConsultancyService[]) =>
      actor!.adminSetConsultancyServices(updated),
    onSuccess: () => {
      toast.success("Consultancy services saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
      setEditId(null);
    },
    onError: () => toast.error("Save failed"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) =>
      actor!.adminTogglePricingItemVisibility("consultancy", id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] }),
  });

  function addService() {
    const id = `svc_${Date.now()}`;
    const newSvc: ConsultancyService = {
      id,
      title: newForm.title,
      description: newForm.description,
      price: BigInt(newForm.price),
      currency: newForm.currency,
      isVisible: true,
      order: BigInt(services.length),
    };
    saveMut.mutate([...services, newSvc]);
    setAddMode(false);
    setNewForm({ title: "", description: "", price: 0, currency: "NGN" });
  }

  function removeService(id: string) {
    saveMut.mutate(services.filter((s) => s.id !== id));
  }

  function saveEdit() {
    saveMut.mutate(
      services.map((s) => (s.id === editId ? { ...s, ...editForm } : s)),
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          Manage your consultancy service offerings with pricing.
        </p>
        <Button
          size="sm"
          onClick={() => setAddMode(true)}
          className="gap-1.5 text-xs bg-primary text-primary-foreground"
          data-ocid="admin.pricing.consultancy.add_button"
        >
          <Plus size={13} /> Add Service
        </Button>
      </div>

      {addMode && (
        <FormCard title="New Consultancy Service">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Title
              </span>
              <input
                className={fieldClass()}
                placeholder="Service title"
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Price (NGN)
              </span>
              <input
                className={fieldClass()}
                type="number"
                value={newForm.price}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, price: Number(e.target.value) }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Description
              </span>
              <textarea
                className={`${fieldClass()} resize-none h-20`}
                placeholder="Service description..."
                value={newForm.description}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addService}
              disabled={saveMut.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              data-ocid="admin.pricing.consultancy.save_button"
            >
              <Save size={13} /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddMode(false)}
              className="gap-1.5 text-xs"
              data-ocid="admin.pricing.consultancy.cancel_button"
            >
              <X size={13} /> Cancel
            </Button>
          </div>
        </FormCard>
      )}

      <div className="space-y-3">
        {services.length === 0 && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.pricing.consultancy.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No services yet. Add your first consultancy service.
            </p>
          </div>
        )}
        {services.map((svc, i) => (
          <div
            key={svc.id}
            className="bg-card border border-border rounded-xl p-4"
            data-ocid={`admin.pricing.consultancy.item.${i + 1}`}
          >
            {editId === svc.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Title
                    </span>
                    <input
                      className={fieldClass()}
                      value={String(editForm.title ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Price
                    </span>
                    <input
                      className={fieldClass()}
                      type="number"
                      value={Number(editForm.price ?? 0)}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          price: BigInt(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Description
                    </span>
                    <textarea
                      className={`${fieldClass()} resize-none h-20`}
                      value={String(editForm.description ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={saveEdit}
                    disabled={saveMut.isPending}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    data-ocid={`admin.pricing.consultancy.save_button.${i + 1}`}
                  >
                    <Save size={12} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditId(null)}
                    className="gap-1.5 text-xs"
                    data-ocid={`admin.pricing.consultancy.cancel_button.${i + 1}`}
                  >
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm mb-1">
                    {svc.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {svc.description}
                  </p>
                  <p className="font-display font-bold text-primary">
                    {svc.currency} {Number(svc.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VisibilityToggle
                    isVisible={svc.isVisible}
                    onToggle={() => toggleMut.mutate(svc.id)}
                    loading={toggleMut.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(svc.id);
                      setEditForm({ ...svc });
                    }}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    data-ocid={`admin.pricing.consultancy.edit_button.${i + 1}`}
                    aria-label="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeService(svc.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    data-ocid={`admin.pricing.consultancy.delete_button.${i + 1}`}
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Competence Pricing ───────────────────────────────────────────────────────

function CompetencePanel({
  items,
  actor,
  queryClient,
}: {
  items: CompetencePricing[];
  actor: ReturnType<typeof createActor>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CompetencePricing>>({});
  const [addMode, setAddMode] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    shortDescription: "",
    price: 0,
    currency: "NGN",
  });

  const saveMut = useMutation({
    mutationFn: (updated: CompetencePricing[]) =>
      actor!.adminSetCompetencePricing(updated),
    onSuccess: () => {
      toast.success("Competence pricing saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
      setEditId(null);
    },
    onError: () => toast.error("Save failed"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) =>
      actor!.adminTogglePricingItemVisibility("competence", id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] }),
  });

  function addItem() {
    const id = `comp_${Date.now()}`;
    saveMut.mutate([
      ...items,
      {
        id,
        title: newForm.title,
        shortDescription: newForm.shortDescription,
        price: BigInt(newForm.price),
        currency: newForm.currency,
        isVisible: true,
        order: BigInt(items.length),
      },
    ]);
    setAddMode(false);
    setNewForm({ title: "", shortDescription: "", price: 0, currency: "NGN" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          Price your competence areas for service delivery.
        </p>
        <Button
          size="sm"
          onClick={() => setAddMode(true)}
          className="gap-1.5 text-xs bg-primary text-primary-foreground"
          data-ocid="admin.pricing.competence.add_button"
        >
          <Plus size={13} /> Add Item
        </Button>
      </div>

      {addMode && (
        <FormCard title="New Competence Pricing Item">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Title
              </span>
              <input
                className={fieldClass()}
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Price (NGN)
              </span>
              <input
                className={fieldClass()}
                type="number"
                value={newForm.price}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, price: Number(e.target.value) }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Short Description
              </span>
              <input
                className={fieldClass()}
                value={newForm.shortDescription}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    shortDescription: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addItem}
              disabled={saveMut.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              data-ocid="admin.pricing.competence.save_button"
            >
              <Save size={13} /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddMode(false)}
              className="gap-1.5 text-xs"
              data-ocid="admin.pricing.competence.cancel_button"
            >
              <X size={13} /> Cancel
            </Button>
          </div>
        </FormCard>
      )}

      <div className="space-y-3">
        {items.length === 0 && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.pricing.competence.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No competence pricing items yet.
            </p>
          </div>
        )}
        {items.map((item, i) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl p-4"
            data-ocid={`admin.pricing.competence.item.${i + 1}`}
          >
            {editId === item.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Title
                    </span>
                    <input
                      className={fieldClass()}
                      value={String(editForm.title ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Price
                    </span>
                    <input
                      className={fieldClass()}
                      type="number"
                      value={Number(editForm.price ?? 0)}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          price: BigInt(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Short Description
                    </span>
                    <input
                      className={fieldClass()}
                      value={String(editForm.shortDescription ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          shortDescription: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      saveMut.mutate(
                        items.map((s) =>
                          s.id === editId ? { ...s, ...editForm } : s,
                        ),
                      )
                    }
                    disabled={saveMut.isPending}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    data-ocid={`admin.pricing.competence.save_button.${i + 1}`}
                  >
                    <Save size={12} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditId(null)}
                    className="gap-1.5 text-xs"
                    data-ocid={`admin.pricing.competence.cancel_button.${i + 1}`}
                  >
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.shortDescription}
                  </p>
                  <p className="font-display font-bold text-primary">
                    {item.currency} {Number(item.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VisibilityToggle
                    isVisible={item.isVisible}
                    onToggle={() => toggleMut.mutate(item.id)}
                    loading={toggleMut.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(item.id);
                      setEditForm({ ...item });
                    }}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    data-ocid={`admin.pricing.competence.edit_button.${i + 1}`}
                    aria-label="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveMut.mutate(items.filter((s) => s.id !== item.id))
                    }
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    data-ocid={`admin.pricing.competence.delete_button.${i + 1}`}
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bundles ──────────────────────────────────────────────────────────────────

function BundlesPanel({
  bundles,
  services,
  actor,
  queryClient,
}: {
  bundles: Bundle[];
  services: ConsultancyService[];
  actor: ReturnType<typeof createActor>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bundle>>({});
  const [addMode, setAddMode] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    bundlePrice: 0,
    currency: "NGN",
    includedServiceIds: [] as string[],
  });

  const saveMut = useMutation({
    mutationFn: (updated: Bundle[]) => actor!.adminSetBundles(updated),
    onSuccess: () => {
      toast.success("Bundles saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
      setEditId(null);
    },
    onError: () => toast.error("Save failed"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) =>
      actor!.adminTogglePricingItemVisibility("bundle", id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] }),
  });

  function toggleNewService(id: string) {
    setNewForm((p) => ({
      ...p,
      includedServiceIds: p.includedServiceIds.includes(id)
        ? p.includedServiceIds.filter((s) => s !== id)
        : [...p.includedServiceIds, id],
    }));
  }

  function addBundle() {
    saveMut.mutate([
      ...bundles,
      {
        id: `bundle_${Date.now()}`,
        ...newForm,
        bundlePrice: BigInt(newForm.bundlePrice),
        isVisible: true,
        order: BigInt(bundles.length),
      },
    ]);
    setAddMode(false);
    setNewForm({
      title: "",
      description: "",
      bundlePrice: 0,
      currency: "NGN",
      includedServiceIds: [],
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          Bundle multiple services at a combined price.
        </p>
        <Button
          size="sm"
          onClick={() => setAddMode(true)}
          className="gap-1.5 text-xs bg-primary text-primary-foreground"
          data-ocid="admin.pricing.bundles.add_button"
        >
          <Plus size={13} /> Add Bundle
        </Button>
      </div>

      {addMode && (
        <FormCard title="New Bundle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Bundle Title
              </span>
              <input
                className={fieldClass()}
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Bundle Price (NGN)
              </span>
              <input
                className={fieldClass()}
                type="number"
                value={newForm.bundlePrice}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    bundlePrice: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Description
              </span>
              <textarea
                className={`${fieldClass()} resize-none h-20`}
                value={newForm.description}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            {services.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Include Services
                </span>
                <div className="flex flex-wrap gap-2">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleNewService(svc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${newForm.includedServiceIds.includes(svc.id) ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"}`}
                    >
                      {svc.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addBundle}
              disabled={saveMut.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              data-ocid="admin.pricing.bundles.save_button"
            >
              <Save size={13} /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddMode(false)}
              className="gap-1.5 text-xs"
              data-ocid="admin.pricing.bundles.cancel_button"
            >
              <X size={13} /> Cancel
            </Button>
          </div>
        </FormCard>
      )}

      <div className="space-y-3">
        {bundles.length === 0 && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.pricing.bundles.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No bundles yet. Create your first service bundle.
            </p>
          </div>
        )}
        {bundles.map((bundle, i) => (
          <div
            key={bundle.id}
            className="bg-card border border-border rounded-xl p-4"
            data-ocid={`admin.pricing.bundles.item.${i + 1}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground text-sm mb-1">
                  {bundle.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {bundle.description}
                </p>
                {bundle.includedServiceIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {bundle.includedServiceIds.map((id) => {
                      const svc = services.find((s) => s.id === id);
                      return svc ? (
                        <span
                          key={id}
                          className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                        >
                          {svc.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                <p className="font-display font-bold text-primary">
                  {bundle.currency}{" "}
                  {Number(bundle.bundlePrice).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <VisibilityToggle
                  isVisible={bundle.isVisible}
                  onToggle={() => toggleMut.mutate(bundle.id)}
                  loading={toggleMut.isPending}
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditId(bundle.id);
                    setEditForm({ ...bundle });
                  }}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  data-ocid={`admin.pricing.bundles.edit_button.${i + 1}`}
                  aria-label="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveMut.mutate(bundles.filter((b) => b.id !== bundle.id))
                  }
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  data-ocid={`admin.pricing.bundles.delete_button.${i + 1}`}
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {editId === bundle.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Title
                    </span>
                    <input
                      className={fieldClass()}
                      value={String(editForm.title ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Bundle Price
                    </span>
                    <input
                      className={fieldClass()}
                      type="number"
                      value={Number(editForm.bundlePrice ?? 0)}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          bundlePrice: BigInt(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Description
                    </span>
                    <textarea
                      className={`${fieldClass()} resize-none h-20`}
                      value={String(editForm.description ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      saveMut.mutate(
                        bundles.map((b) =>
                          b.id === editId ? { ...b, ...editForm } : b,
                        ),
                      )
                    }
                    disabled={saveMut.isPending}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    data-ocid={`admin.pricing.bundles.save_button.${i + 1}`}
                  >
                    <Save size={12} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditId(null)}
                    className="gap-1.5 text-xs"
                    data-ocid={`admin.pricing.bundles.cancel_button.${i + 1}`}
                  >
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Giveaways ────────────────────────────────────────────────────────────────

function GiveawaysPanel({
  giveaways,
  actor,
  queryClient,
}: {
  giveaways: GiveawayItem[];
  actor: ReturnType<typeof createActor>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GiveawayItem>>({});
  const [addMode, setAddMode] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    isFree: true,
    discountedPrice: 0,
    currency: "NGN",
  });

  const saveMut = useMutation({
    mutationFn: (updated: GiveawayItem[]) => actor!.adminSetGiveaways(updated),
    onSuccess: () => {
      toast.success("Giveaways saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
      setEditId(null);
    },
    onError: () => toast.error("Save failed"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) =>
      actor!.adminTogglePricingItemVisibility("giveaway", id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] }),
  });

  function addGiveaway() {
    const id = `giveaway_${Date.now()}`;
    saveMut.mutate([
      ...giveaways,
      {
        id,
        title: newForm.title,
        description: newForm.description,
        isFree: newForm.isFree,
        discountedPrice: newForm.isFree
          ? undefined
          : BigInt(newForm.discountedPrice),
        currency: newForm.currency,
        isVisible: true,
        isActive: true,
        order: BigInt(giveaways.length),
      },
    ]);
    setAddMode(false);
    setNewForm({
      title: "",
      description: "",
      isFree: true,
      discountedPrice: 0,
      currency: "NGN",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          Manage free or discounted giveaway items.
        </p>
        <Button
          size="sm"
          onClick={() => setAddMode(true)}
          className="gap-1.5 text-xs bg-primary text-primary-foreground"
          data-ocid="admin.pricing.giveaways.add_button"
        >
          <Plus size={13} /> Add Giveaway
        </Button>
      </div>

      {addMode && (
        <FormCard title="New Giveaway">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Title
              </span>
              <input
                className={fieldClass()}
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Type
              </span>
              <select
                className={fieldClass()}
                value={newForm.isFree ? "free" : "discounted"}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    isFree: e.target.value === "free",
                  }))
                }
              >
                <option value="free">Free</option>
                <option value="discounted">Discounted Price</option>
              </select>
            </div>
            {!newForm.isFree && (
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Discounted Price (NGN)
                </span>
                <input
                  className={fieldClass()}
                  type="number"
                  value={newForm.discountedPrice}
                  onChange={(e) =>
                    setNewForm((p) => ({
                      ...p,
                      discountedPrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Description
              </span>
              <textarea
                className={`${fieldClass()} resize-none h-20`}
                value={newForm.description}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addGiveaway}
              disabled={saveMut.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              data-ocid="admin.pricing.giveaways.save_button"
            >
              <Save size={13} /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddMode(false)}
              className="gap-1.5 text-xs"
              data-ocid="admin.pricing.giveaways.cancel_button"
            >
              <X size={13} /> Cancel
            </Button>
          </div>
        </FormCard>
      )}

      <div className="space-y-3">
        {giveaways.length === 0 && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.pricing.giveaways.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No giveaways yet. Add your first giveaway item.
            </p>
          </div>
        )}
        {giveaways.map((item, i) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl p-4"
            data-ocid={`admin.pricing.giveaways.item.${i + 1}`}
          >
            {editId === item.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Title
                    </span>
                    <input
                      className={fieldClass()}
                      value={String(editForm.title ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Type
                    </span>
                    <select
                      className={fieldClass()}
                      value={editForm.isFree ? "free" : "discounted"}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          isFree: e.target.value === "free",
                        }))
                      }
                    >
                      <option value="free">Free</option>
                      <option value="discounted">Discounted Price</option>
                    </select>
                  </div>
                  {!editForm.isFree && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                        Discounted Price
                      </span>
                      <input
                        className={fieldClass()}
                        type="number"
                        value={Number(editForm.discountedPrice ?? 0)}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            discountedPrice: BigInt(e.target.value || 0),
                          }))
                        }
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Description
                    </span>
                    <textarea
                      className={`${fieldClass()} resize-none h-20`}
                      value={String(editForm.description ?? "")}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      saveMut.mutate(
                        giveaways.map((g) =>
                          g.id === editId ? { ...g, ...editForm } : g,
                        ),
                      )
                    }
                    disabled={saveMut.isPending}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    data-ocid={`admin.pricing.giveaways.save_button.${i + 1}`}
                  >
                    <Save size={12} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditId(null)}
                    className="gap-1.5 text-xs"
                    data-ocid={`admin.pricing.giveaways.cancel_button.${i + 1}`}
                  >
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-semibold text-foreground text-sm">
                      {item.title}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold ${item.isFree ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-400"}`}
                    >
                      {item.isFree
                        ? "FREE"
                        : `NGN ${Number(item.discountedPrice).toLocaleString()}`}
                    </span>
                    {!item.isActive && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-semibold uppercase">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VisibilityToggle
                    isVisible={item.isVisible}
                    onToggle={() => toggleMut.mutate(item.id)}
                    loading={toggleMut.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(item.id);
                      setEditForm({ ...item });
                    }}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    data-ocid={`admin.pricing.giveaways.edit_button.${i + 1}`}
                    aria-label="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveMut.mutate(giveaways.filter((g) => g.id !== item.id))
                    }
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    data-ocid={`admin.pricing.giveaways.delete_button.${i + 1}`}
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────

export function AdminPricing() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PricingTab>("landing");
  const { data: pricing, isLoading } = useQuery<PricingData>({
    queryKey: ["admin", "pricing"],
    queryFn: () => actor!.adminGetPricingData(),
    enabled,
  });

  const landingOffers = pricing?.landingPageOffers ?? [];
  const consultancyServices = pricing?.consultancyServices ?? [];
  const competencePricing = pricing?.competencePricing ?? [];
  const bundles = pricing?.bundles ?? [];
  const giveaways = pricing?.giveaways ?? [];

  const tabCounts: Record<PricingTab, number> = {
    landing: landingOffers.length,
    consultancy: consultancyServices.length,
    competence: competencePricing.length,
    bundles: bundles.length,
    giveaways: giveaways.length,
  };

  return (
    <div data-ocid="admin.pricing.section">
      <SectionHeader
        title="Pricing Engine"
        subtitle="Manage all your pricing items, bundles, and giveaways — toggle visibility without deleting"
      />

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.pricing.loading_state">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          {/* Sub-tab navigation */}
          <div
            className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-border"
            role="tablist"
          >
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                data-ocid={`admin.pricing.tab.${id}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-body font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === id
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-primary/30"
                }`}
              >
                {icon}
                {label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${activeTab === id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {tabCounts[id]}
                </span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div>
            {activeTab === "landing" && (
              <LandingOffersPanel
                offers={landingOffers}
                actor={actor!}
                queryClient={queryClient}
              />
            )}
            {activeTab === "consultancy" && (
              <ConsultancyPanel
                services={consultancyServices}
                actor={actor!}
                queryClient={queryClient}
              />
            )}
            {activeTab === "competence" && (
              <CompetencePanel
                items={competencePricing}
                actor={actor!}
                queryClient={queryClient}
              />
            )}
            {activeTab === "bundles" && (
              <BundlesPanel
                bundles={bundles}
                services={consultancyServices}
                actor={actor!}
                queryClient={queryClient}
              />
            )}
            {activeTab === "giveaways" && (
              <GiveawaysPanel
                giveaways={giveaways}
                actor={actor!}
                queryClient={queryClient}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
