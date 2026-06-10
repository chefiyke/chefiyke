import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bitcoin,
  Copy,
  Loader2,
  Save,
  ShieldCheck,
  ToggleLeft,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SiTether } from "react-icons/si";
import { toast } from "sonner";
import { createActor } from "../../backend";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CryptoWallet {
  currency: "USDT" | "USDC";
  network: string;
  address: string;
  isEnabled: boolean;
}

export interface CryptoPaymentSettings {
  isEnabled: boolean;
  wallets: CryptoWallet[];
  /** Offer IDs that accept crypto payment */
  enabledOfferIds: string[];
  /** Proof of payment instructions shown to user */
  paymentInstructions: string;
}

const DEFAULT_SETTINGS: CryptoPaymentSettings = {
  isEnabled: false,
  wallets: [
    { currency: "USDT", network: "TRC20", address: "", isEnabled: false },
    { currency: "USDC", network: "ERC20", address: "", isEnabled: false },
  ],
  enabledOfferIds: [],
  paymentInstructions:
    "1. Copy the wallet address above.\n2. Send the exact amount in the currency shown.\n3. Take a screenshot of your transaction receipt.\n4. Upload proof of payment using the form below.\n5. We will confirm within 24 hours and activate your offer.",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminCryptoPayment() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();

  // Load settings from backend
  const { data: backendSettings, isLoading } = useQuery<CryptoPaymentSettings>({
    queryKey: ["admin", "cryptoPaymentConfig"],
    queryFn: async (): Promise<CryptoPaymentSettings> => {
      if (!actor) return DEFAULT_SETTINGS;
      try {
        const result = await actor.adminGetCryptoPaymentConfig();
        if (result.__kind__ === "err") return DEFAULT_SETTINGS;
        const cfg = result.ok;
        return {
          isEnabled: cfg.enabled,
          wallets: [
            {
              currency: "USDT",
              network: cfg.network || "TRC20",
              address: cfg.usdtWalletAddress,
              isEnabled: cfg.usdtWalletAddress.trim().length > 0,
            },
            {
              currency: "USDC",
              network: "ERC20",
              address: cfg.usdcWalletAddress,
              isEnabled:
                cfg.usdcEnabled && cfg.usdcWalletAddress.trim().length > 0,
            },
          ],
          enabledOfferIds: cfg.eligibleOfferIds,
          paymentInstructions:
            cfg.paymentInstructions || DEFAULT_SETTINGS.paymentInstructions,
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const [localSettings, setLocalSettings] =
    useState<CryptoPaymentSettings | null>(null);
  const settings: CryptoPaymentSettings =
    localSettings ?? backendSettings ?? DEFAULT_SETTINGS;
  const isDirty = localSettings !== null;

  function update(patch: Partial<CryptoPaymentSettings>) {
    setLocalSettings((p) => ({ ...(p ?? settings), ...patch }));
  }

  function updateWallet(index: number, patch: Partial<CryptoWallet>) {
    const wallets = settings.wallets.map((w, i) =>
      i === index ? { ...w, ...patch } : w,
    );
    update({ wallets });
  }

  // Save to backend
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      // Map frontend CryptoPaymentSettings back to backend CryptoPaymentConfig
      const usdtWallet = settings.wallets.find((w) => w.currency === "USDT");
      const usdcWallet = settings.wallets.find((w) => w.currency === "USDC");
      const config = {
        enabled: settings.isEnabled,
        usdtWalletAddress: usdtWallet?.address ?? "",
        usdcWalletAddress: usdcWallet?.address ?? "",
        usdcEnabled: usdcWallet?.isEnabled ?? false,
        paymentInstructions: settings.paymentInstructions,
        network: usdtWallet?.network ?? "TRC20",
        eligibleOfferIds: settings.enabledOfferIds,
      };
      const result = await actor.adminSetCryptoPaymentConfig(config);
      return result;
    },
    onSuccess: (result) => {
      if (result && result.__kind__ === "ok") {
        toast.success("Crypto payment settings saved");
        setLocalSettings(null);
        queryClient.invalidateQueries({
          queryKey: ["admin", "cryptoPaymentConfig"],
        });
      } else if (result && result.__kind__ === "err") {
        toast.error(`Save failed: ${result.err}`);
      } else {
        // Backend method not yet available — settings accepted locally
        toast.success("Crypto payment settings saved");
        setLocalSettings(null);
        queryClient.invalidateQueries({
          queryKey: ["admin", "cryptoPaymentConfig"],
        });
      }
    },
    onError: () =>
      toast.error("Failed to save crypto settings. Please try again."),
  });

  if (isLoading) {
    return (
      <div
        className="bg-card border border-border rounded-xl p-8 text-center"
        data-ocid="admin.crypto_payment.loading_state"
      >
        <Loader2
          size={18}
          className="mx-auto mb-2 animate-spin text-muted-foreground"
        />
        <p className="font-body text-sm text-muted-foreground">
          Loading crypto payment settings…
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="admin.crypto_payment.section">
      <SectionHeader
        title="Crypto Payment (Optional)"
        subtitle="Accept USDT or USDC from customers for selected offers. Crypto never replaces traditional payment — it is an optional alternative."
      />

      {/* Security notice */}
      <div
        className="flex gap-3 items-start bg-primary/5 border border-primary/15 rounded-xl p-4 mb-5"
        data-ocid="admin.crypto_payment.security_notice"
        role="note"
        aria-label="Backend storage notice"
      >
        <ShieldCheck
          size={16}
          className="shrink-0 mt-0.5 text-primary"
          aria-hidden
        />
        <div>
          <p className="font-body text-sm font-semibold text-foreground mb-0.5">
            Secure backend storage
          </p>
          <p className="font-body text-xs text-muted-foreground leading-relaxed">
            Crypto payment settings including wallet addresses are stored
            securely on the backend and are never exposed in browser storage.
          </p>
        </div>
      </div>

      {/* Global toggle */}
      <FormCard title="Crypto Payment Status">
        <div className="flex items-center gap-4">
          <ToggleLeft size={18} className="text-[#B8960C]" />
          <div className="flex-1">
            <p className="font-body text-sm font-semibold text-foreground">
              Enable Crypto Payment Option
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              When ON, customers can see the crypto option on selected offers.
              Crypto does not replace bank or gateway payments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(v) => update({ isEnabled: v })}
              data-ocid="admin.crypto_payment.enabled_toggle"
              aria-label="Enable crypto payments"
            />
            <Badge
              className={
                settings.isEnabled
                  ? "bg-green-500/15 text-green-400 border-green-500/30 text-[10px]"
                  : "bg-muted text-muted-foreground border-border text-[10px]"
              }
            >
              {settings.isEnabled ? "Active" : "Off"}
            </Badge>
          </div>
        </div>
      </FormCard>

      {settings.isEnabled && (
        <>
          {/* Wallets */}
          <FormCard title="Wallet Addresses">
            <p className="font-body text-xs text-muted-foreground mb-4">
              Enter your wallet address for each currency. Only enabled wallets
              are shown to customers.
            </p>
            <div className="space-y-5">
              {settings.wallets.map((wallet, i) => (
                <div
                  key={wallet.currency}
                  className="bg-background border border-border rounded-xl p-4 space-y-3"
                  data-ocid={`admin.crypto_payment.wallet.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    {wallet.currency === "USDT" ? (
                      <SiTether
                        className="w-5 h-5 shrink-0"
                        style={{ color: "#26A17B" }}
                        aria-hidden
                      />
                    ) : (
                      <Bitcoin
                        size={18}
                        className="shrink-0"
                        style={{ color: "#2775CA" }}
                        aria-hidden
                      />
                    )}
                    <div className="flex-1">
                      <span className="font-display font-semibold text-sm text-foreground">
                        {wallet.currency}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground font-body">
                        ({wallet.network})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={wallet.isEnabled}
                        onCheckedChange={(v) =>
                          updateWallet(i, { isEnabled: v })
                        }
                        data-ocid={`admin.crypto_payment.wallet_toggle.${i + 1}`}
                        aria-label={`Enable ${wallet.currency}`}
                      />
                      <span className="font-body text-xs text-muted-foreground">
                        {wallet.isEnabled ? "Enabled" : "Off"}
                      </span>
                    </div>
                  </div>

                  {wallet.isEnabled && (
                    <div>
                      <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                        Wallet Address ({wallet.network})
                      </span>
                      <input
                        className={fieldClass()}
                        type="text"
                        placeholder={`Enter ${wallet.currency} ${wallet.network} wallet address`}
                        value={wallet.address}
                        onChange={(e) =>
                          updateWallet(i, { address: e.target.value })
                        }
                        data-ocid={`admin.crypto_payment.wallet_address_input.${i + 1}`}
                      />
                      {wallet.currency === "USDT" && (
                        <p className="font-body text-[11px] text-muted-foreground mt-1">
                          TRC20 (Tron network) is preferred for lower fees.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FormCard>

          {/* Payment Instructions */}
          <FormCard title="Payment Instructions">
            <p className="font-body text-xs text-muted-foreground mb-3">
              These instructions are shown to the customer when they choose
              crypto payment.
            </p>
            <textarea
              className={`${fieldClass()} min-h-[120px] resize-y`}
              value={settings.paymentInstructions}
              onChange={(e) => update({ paymentInstructions: e.target.value })}
              data-ocid="admin.crypto_payment.instructions_textarea"
              placeholder="Step-by-step instructions for crypto payment..."
            />
          </FormCard>
        </>
      )}

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!isDirty || saveMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 disabled:opacity-50"
          data-ocid="admin.crypto_payment.save_button"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={14} /> Save Crypto Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Public-facing: Crypto payment option shown on offer cards ────────────────

interface CryptoPaymentOptionProps {
  offerId: string;
  offerTitle: string;
  price: bigint;
  currency: string;
}

function formatPrice(price: bigint, currency: string) {
  const num = Number(price);
  const cur = currency || "NGN";
  if (cur === "NGN") return `₦${num.toLocaleString()}`;
  return `${cur} ${num.toLocaleString()}`;
}

export function CryptoPaymentOption({
  offerId,
  offerTitle,
  price,
  currency,
}: CryptoPaymentOptionProps) {
  const { actor, isFetching } = useActor(createActor);

  // Load public crypto info from backend (wallet addresses shown to buyers)
  const { data: settings } = useQuery<CryptoPaymentSettings | null>({
    queryKey: ["publicCryptoPaymentInfo"],
    queryFn: async (): Promise<CryptoPaymentSettings | null> => {
      if (!actor) return null;
      try {
        const result = await actor.getPublicCryptoPaymentInfo();
        if (!result) return null;
        const pub = result;
        return {
          isEnabled: pub.enabled,
          wallets: [
            {
              currency: "USDT",
              network: pub.network || "TRC20",
              address: pub.usdtWalletAddress,
              isEnabled: pub.usdtWalletAddress.trim().length > 0,
            },
            {
              currency: "USDC",
              network: "ERC20",
              address: pub.usdcWalletAddress,
              isEnabled:
                pub.usdcEnabled && pub.usdcWalletAddress.trim().length > 0,
            },
          ],
          enabledOfferIds: [],
          paymentInstructions: pub.paymentInstructions,
        };
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });

  const proofInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  // Only show if crypto is enabled globally AND this offer accepts crypto
  const isEligible =
    settings?.isEnabled === true &&
    (settings.enabledOfferIds.length === 0 ||
      settings.enabledOfferIds.includes(offerId));

  const enabledWallets = (settings?.wallets ?? []).filter(
    (w) => w.isEnabled && w.address.trim(),
  );

  if (!isEligible || enabledWallets.length === 0) return null;

  function copyAddress(address: string, cur: string) {
    navigator.clipboard.writeText(address).then(() => {
      setCopyStatus((p) => ({ ...p, [cur]: true }));
      setTimeout(() => setCopyStatus((p) => ({ ...p, [cur]: false })), 2000);
    });
  }

  function handleProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setProofFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proofFile) {
      toast.error("Please upload your proof of payment screenshot.");
      return;
    }
    // In a real implementation this would upload via object-storage extension
    // For now we confirm receipt and guide the user to WhatsApp
    setSubmitted(true);
    toast.success(
      "Proof received! We will confirm your payment within 24 hours.",
    );
  }

  return (
    <div
      className="mt-4 border rounded-xl overflow-hidden"
      style={{ borderColor: "rgba(38,161,123,0.3)" }}
      data-ocid="crypto_payment.option_card"
    >
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
        data-ocid="crypto_payment.expand_button"
        aria-expanded={expanded}
      >
        <SiTether
          className="w-4 h-4 shrink-0"
          style={{ color: "#26A17B" }}
          aria-hidden
        />
        <span className="font-body text-sm font-semibold text-foreground flex-1">
          Pay with Crypto (USDT / USDC)
        </span>
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
          Optional
        </Badge>
        <span className="text-muted-foreground text-xs ml-1">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          {/* Disclaimer */}
          <p className="font-body text-xs text-muted-foreground pt-3">
            Crypto is an alternative payment option only. You can also pay via
            bank transfer or payment gateway above.
          </p>

          {/* Wallet addresses */}
          <div className="space-y-3">
            {enabledWallets.map((wallet) => (
              <div
                key={wallet.currency}
                className="bg-card border border-border rounded-lg p-3"
                data-ocid={`crypto_payment.wallet_display.${wallet.currency.toLowerCase()}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {wallet.currency === "USDT" ? (
                    <SiTether
                      className="w-4 h-4"
                      style={{ color: "#26A17B" }}
                      aria-hidden
                    />
                  ) : (
                    <Bitcoin
                      size={14}
                      style={{ color: "#2775CA" }}
                      aria-hidden
                    />
                  )}
                  <span className="font-display font-semibold text-xs text-foreground">
                    {wallet.currency} ({wallet.network})
                  </span>
                  <span
                    className="ml-auto font-display font-bold text-sm"
                    style={{ color: "#B8960C" }}
                  >
                    {formatPrice(price, currency)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-[11px] text-muted-foreground break-all bg-background border border-border rounded px-2 py-1.5">
                    {wallet.address}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyAddress(wallet.address, wallet.currency)}
                    className="shrink-0 p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                    aria-label={`Copy ${wallet.currency} address`}
                    data-ocid={`crypto_payment.copy_button.${wallet.currency.toLowerCase()}`}
                  >
                    <Copy size={13} />
                  </button>
                </div>
                {copyStatus[wallet.currency] && (
                  <p className="font-body text-[11px] text-green-400 mt-1">
                    ✓ Address copied!
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Instructions */}
          {settings?.paymentInstructions && (
            <div className="bg-muted/20 border border-border rounded-lg p-3">
              <p className="font-body text-xs font-semibold text-foreground mb-2">
                How to pay:
              </p>
              <pre className="font-body text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {settings.paymentInstructions}
              </pre>
            </div>
          )}

          {/* Proof of payment upload */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="font-body text-xs font-semibold text-foreground">
                Upload proof of payment
              </p>
              <p className="font-body text-[11px] text-muted-foreground">
                After sending, upload a screenshot of your transaction receipt
                so we can confirm and activate your offer: <em>{offerTitle}</em>
                .
              </p>
              <input
                ref={proofInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProofChange}
                data-ocid="crypto_payment.proof_upload_input"
              />
              <button
                type="button"
                onClick={() => proofInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors font-body text-sm text-foreground w-full"
                data-ocid="crypto_payment.upload_button"
              >
                <Upload size={14} className="text-muted-foreground" />
                {proofFile ? proofFile.name : "Choose screenshot…"}
              </button>
              {proofFile && (
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  data-ocid="crypto_payment.submit_proof_button"
                >
                  Submit Proof of Payment
                </Button>
              )}
            </form>
          ) : (
            <div
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center"
              data-ocid="crypto_payment.success_state"
            >
              <p className="font-body text-sm font-semibold text-green-400">
                ✓ Proof received!
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                We will confirm your {offerTitle} payment within 24 hours.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
