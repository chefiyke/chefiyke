import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Filter,
  Info,
  Save,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  FlutterwaveConfig,
  LocalBankConfig,
  PaymentConfig,
  PaymentOrder,
  PaystackConfig,
} from "../../backend.d";
import {
  PaymentOrderStatus,
  Variant_localBank_paystack_flutterwave,
} from "../../backend.d";
import { useRole } from "../../hooks/useRole";
import { AdminCryptoPayment } from "./AdminCryptoPayment";
import { FormCard, SectionHeader, fieldClass, formatDate } from "./AdminShared";

// ─── Types ─────────────────────────────────────────────────────────────────

interface BankForm {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

/** Only the public-safe gateway fields are editable in the UI.
 *  Secret keys and webhook secrets are configured server-side only. */
interface GatewayPublicForm {
  publicKey: string;
}

const EMPTY_BANK: BankForm = {
  bankName: "",
  accountNumber: "",
  accountName: "",
};
const EMPTY_GATEWAY: GatewayPublicForm = {
  publicKey: "",
};

// ─── Status helpers ─────────────────────────────────────────────────────────

const STATUS_BADGE: Record<PaymentOrderStatus, string> = {
  [PaymentOrderStatus.Pending]:
    "bg-[#B8960C]/20 text-[#B8960C] border-[#B8960C]/40",
  [PaymentOrderStatus.Completed]:
    "bg-green-500/15 text-green-400 border-green-500/30",
  [PaymentOrderStatus.Rejected]:
    "bg-destructive/15 text-destructive border-destructive/30",
  [PaymentOrderStatus.Failed]:
    "bg-destructive/15 text-destructive border-destructive/30",
};

const METHOD_LABEL: Record<Variant_localBank_paystack_flutterwave, string> = {
  [Variant_localBank_paystack_flutterwave.localBank]: "Bank Transfer",
  [Variant_localBank_paystack_flutterwave.paystack]: "Paystack",
  [Variant_localBank_paystack_flutterwave.flutterwave]: "Flutterwave",
};

function PaymentStatusBadge({ status }: { status: PaymentOrderStatus }) {
  return (
    <Badge
      className={`text-[10px] capitalize ${STATUS_BADGE[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </Badge>
  );
}

// ─── Payment Methods Tab ─────────────────────────────────────────────────────

function PaymentMethodsTab() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();

  const [bank, setBank] = useState<BankForm>(EMPTY_BANK);
  const [paystack, setPaystack] = useState<GatewayPublicForm>(EMPTY_GATEWAY);
  const [flutterwave, setFlutterwave] =
    useState<GatewayPublicForm>(EMPTY_GATEWAY);
  const [enabledMethods, setEnabledMethods] = useState<
    Set<Variant_localBank_paystack_flutterwave>
  >(new Set());
  const [priceNgn, setPriceNgn] = useState("0");

  const { data: config, isLoading } = useQuery<PaymentConfig>({
    queryKey: ["admin", "paymentConfig"],
    queryFn: () => actor!.adminGetPaymentConfig(),
    enabled,
  });

  useEffect(() => {
    if (!config) return;
    if (config.localBank) {
      setBank({
        bankName: config.localBank.bankName,
        accountNumber: config.localBank.accountNumber,
        accountName: config.localBank.accountName,
      });
    }
    if (config.paystack) {
      setPaystack({ publicKey: config.paystack.publicKey });
    }
    if (config.flutterwave) {
      setFlutterwave({ publicKey: config.flutterwave.publicKey });
    }
    setEnabledMethods(new Set(config.enabledMethods));
    setPriceNgn(config.servicePriceNgn.toString());
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const localBankConfig: LocalBankConfig = {
        bankName: bank.bankName.trim(),
        accountNumber: bank.accountNumber.trim(),
        accountName: bank.accountName.trim(),
      };
      // Preserve existing secret keys from the loaded config — never send new ones from UI
      const paystackConfig: PaystackConfig = {
        publicKey: paystack.publicKey.trim(),
        secretKey: config?.paystack?.secretKey ?? "",
        webhookSecret: config?.paystack?.webhookSecret ?? "",
      };
      const flutterwaveConfig: FlutterwaveConfig = {
        publicKey: flutterwave.publicKey.trim(),
        secretKey: config?.flutterwave?.secretKey ?? "",
        webhookSecret: config?.flutterwave?.webhookSecret ?? "",
      };

      const payload: PaymentConfig = {
        localBank: localBankConfig.bankName ? localBankConfig : undefined,
        paystack: paystackConfig.publicKey ? paystackConfig : undefined,
        flutterwave: flutterwaveConfig.publicKey
          ? flutterwaveConfig
          : undefined,
        enabledMethods: Array.from(enabledMethods),
        servicePriceNgn: BigInt(Math.max(0, Number.parseInt(priceNgn) || 0)),
        defaultCurrency: config?.defaultCurrency ?? "NGN",
        updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      return actor!.adminSetPaymentConfig(payload);
    },
    onSuccess: (result) => {
      if (result.__kind__ === "ok") {
        toast.success("Payment configuration saved");
        queryClient.invalidateQueries({ queryKey: ["admin", "paymentConfig"] });
      } else {
        toast.error(`Save failed: ${result.err}`);
      }
    },
    onError: () => toast.error("Failed to save payment config"),
  });

  function toggleMethod(m: Variant_localBank_paystack_flutterwave) {
    setEnabledMethods((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }

  const setBank_ = (k: keyof BankForm, v: string) =>
    setBank((p) => ({ ...p, [k]: v }));

  if (isLoading) {
    return (
      <div
        className="bg-card border border-border rounded-xl p-8 text-center"
        data-ocid="admin.payment_config.loading_state"
      >
        <p className="font-body text-sm text-muted-foreground">
          Loading payment configuration…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Security notice */}
      <div
        className="flex gap-3 items-start bg-muted/30 border border-border rounded-xl p-4"
        role="note"
      >
        <Info size={15} className="shrink-0 mt-0.5 text-muted-foreground" />
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Security note:</strong> Payment
          secret keys and webhook secrets are configured server-side and cannot
          be viewed or changed here. Only the public key and gateway
          enable/disable status can be updated from this panel.
        </p>
      </div>

      {/* Service Price */}
      <FormCard title="Service Price">
        <div className="max-w-xs">
          <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
            Price (₦ Naira)
          </span>
          <input
            className={fieldClass()}
            type="number"
            min="0"
            placeholder="e.g. 150000"
            value={priceNgn}
            onChange={(e) => setPriceNgn(e.target.value)}
            data-ocid="admin.payment_config.price_input"
          />
          <p className="font-body text-[11px] text-muted-foreground mt-1">
            This is the publicly displayed service price.
          </p>
        </div>
      </FormCard>

      {/* Local Bank */}
      <FormCard title="Local Bank Transfer">
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={16} className="text-[#B8960C]" />
          <span className="font-body text-sm text-foreground">
            Bank Transfer
          </span>
          <Switch
            checked={enabledMethods.has(
              Variant_localBank_paystack_flutterwave.localBank,
            )}
            onCheckedChange={() =>
              toggleMethod(Variant_localBank_paystack_flutterwave.localBank)
            }
            data-ocid="admin.payment_config.bank_toggle"
            aria-label="Enable bank transfer"
          />
          <span className="font-body text-xs text-muted-foreground">
            {enabledMethods.has(
              Variant_localBank_paystack_flutterwave.localBank,
            )
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Bank Name
            </span>
            <input
              className={fieldClass()}
              type="text"
              placeholder="e.g. First Bank"
              value={bank.bankName}
              onChange={(e) => setBank_("bankName", e.target.value)}
              data-ocid="admin.payment_config.bank_name_input"
            />
          </div>
          <div>
            <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Account Number
            </span>
            <input
              className={fieldClass()}
              type="text"
              placeholder="0123456789"
              value={bank.accountNumber}
              onChange={(e) => setBank_("accountNumber", e.target.value)}
              data-ocid="admin.payment_config.account_number_input"
            />
          </div>
          <div>
            <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Account Name
            </span>
            <input
              className={fieldClass()}
              type="text"
              placeholder="Full account name"
              value={bank.accountName}
              onChange={(e) => setBank_("accountName", e.target.value)}
              data-ocid="admin.payment_config.account_name_input"
            />
          </div>
        </div>
      </FormCard>

      {/* Paystack */}
      <FormCard title="Paystack">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={16} className="text-[#B8960C]" />
          <span className="font-body text-sm text-foreground">
            Paystack Gateway
          </span>
          <Switch
            checked={enabledMethods.has(
              Variant_localBank_paystack_flutterwave.paystack,
            )}
            onCheckedChange={() =>
              toggleMethod(Variant_localBank_paystack_flutterwave.paystack)
            }
            data-ocid="admin.payment_config.paystack_toggle"
            aria-label="Enable Paystack"
          />
          <span className="font-body text-xs text-muted-foreground">
            {enabledMethods.has(Variant_localBank_paystack_flutterwave.paystack)
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>
        <div className="max-w-sm">
          <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
            Public Key
          </span>
          <input
            className={fieldClass()}
            type="text"
            placeholder="pk_live_…"
            value={paystack.publicKey}
            onChange={(e) => setPaystack({ publicKey: e.target.value })}
            data-ocid="admin.payment_config.paystack_public_key_input"
          />
        </div>
      </FormCard>

      {/* Flutterwave */}
      <FormCard title="Flutterwave">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={16} className="text-[#B8960C]" />
          <span className="font-body text-sm text-foreground">
            Flutterwave Gateway
          </span>
          <Switch
            checked={enabledMethods.has(
              Variant_localBank_paystack_flutterwave.flutterwave,
            )}
            onCheckedChange={() =>
              toggleMethod(Variant_localBank_paystack_flutterwave.flutterwave)
            }
            data-ocid="admin.payment_config.flutterwave_toggle"
            aria-label="Enable Flutterwave"
          />
          <span className="font-body text-xs text-muted-foreground">
            {enabledMethods.has(
              Variant_localBank_paystack_flutterwave.flutterwave,
            )
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>
        <div className="max-w-sm">
          <span className="font-body text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
            Public Key
          </span>
          <input
            className={fieldClass()}
            type="text"
            placeholder="FLWPUBK_TEST-…"
            value={flutterwave.publicKey}
            onChange={(e) => setFlutterwave({ publicKey: e.target.value })}
            data-ocid="admin.payment_config.flutterwave_public_key_input"
          />
        </div>
      </FormCard>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          data-ocid="admin.payment_config.save_button"
        >
          <Save size={14} />
          {saveMutation.isPending ? "Saving…" : "Save Payment Config"}
        </Button>
      </div>
    </div>
  );
}

// ─── Payment Orders Tab ──────────────────────────────────────────────────────

function PaymentOrdersTab() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders = [], isLoading } = useQuery<PaymentOrder[]>({
    queryKey: ["admin", "paymentOrders"],
    queryFn: () => actor!.adminListPaymentOrders(),
    enabled,
  });

  const approveMutation = useMutation({
    mutationFn: ({
      orderId,
      approve,
    }: {
      orderId: bigint;
      approve: boolean;
    }) => actor!.adminApprovePaymentOrder(orderId, approve, null),
    onSuccess: (result, vars) => {
      if (result.__kind__ === "ok") {
        toast.success(vars.approve ? "Order approved" : "Order rejected");
        queryClient.invalidateQueries({ queryKey: ["admin", "paymentOrders"] });
      } else {
        toast.error(`Action failed: ${result.err}`);
      }
    },
    onError: () => toast.error("Action failed"),
  });

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div>
      {/* Filter */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <Filter size={14} className="text-muted-foreground" />
        <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">
          Filter:
        </span>
        {(
          [
            "all",
            PaymentOrderStatus.Pending,
            PaymentOrderStatus.Completed,
            PaymentOrderStatus.Rejected,
            PaymentOrderStatus.Failed,
          ] as string[]
        ).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            data-ocid={`admin.payment_orders.filter.${s.toLowerCase()}`}
            className={`font-body text-xs px-3 py-1 rounded-full border transition-colors ${
              statusFilter === s
                ? "bg-primary/20 border-primary text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl p-8 text-center"
          data-ocid="admin.payment_orders.loading_state"
        >
          <p className="font-body text-sm text-muted-foreground">
            Loading orders…
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-10 text-center"
          data-ocid="admin.payment_orders.empty_state"
        >
          <p className="font-body text-sm text-muted-foreground">
            No payment orders found.
          </p>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.payment_orders.table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Order ID",
                    "Payer",
                    "Amount",
                    "Method",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr
                    key={order.orderId.toString()}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.payment_orders.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      #{order.orderId.toString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body text-xs text-foreground truncate max-w-[130px]">
                        {order.payerName}
                      </p>
                      <p className="font-body text-[11px] text-muted-foreground truncate max-w-[130px]">
                        {order.payerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-[#B8960C] font-semibold whitespace-nowrap">
                      ₦{Number(order.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {METHOD_LABEL[order.method] ?? String(order.method)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PaymentStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.status === PaymentOrderStatus.Pending &&
                        order.method ===
                          Variant_localBank_paystack_flutterwave.localBank && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                approveMutation.mutate({
                                  orderId: order.orderId,
                                  approve: true,
                                })
                              }
                              disabled={approveMutation.isPending}
                              data-ocid={`admin.payment_orders.approve_button.${i + 1}`}
                              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                              aria-label="Approve order"
                            >
                              <CheckCircle2 size={11} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                approveMutation.mutate({
                                  orderId: order.orderId,
                                  approve: false,
                                })
                              }
                              disabled={approveMutation.isPending}
                              data-ocid={`admin.payment_orders.reject_button.${i + 1}`}
                              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 transition-colors disabled:opacity-50"
                              aria-label="Reject order"
                            >
                              <XCircle size={11} /> Reject
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function AdminPaymentConfig() {
  const { isOwner } = useRole();
  const [tab, setTab] = useState<"methods" | "orders" | "crypto">("methods");

  if (!isOwner) {
    return (
      <div
        className="bg-card border border-border rounded-xl p-8 text-center"
        data-ocid="admin.payment_config.access_denied"
      >
        <p className="font-body text-sm text-muted-foreground">
          Payment configuration is restricted to the Platform Owner.
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="admin.payment_config.section">
      <SectionHeader
        title="Payment Configuration"
        subtitle="Manage payment methods, API keys, and review payment orders"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-card border border-border rounded-xl w-fit">
        {(["methods", "orders", "crypto"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            data-ocid={`admin.payment_config.tab.${t}`}
            className={`font-body text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              tab === t
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "methods"
              ? "Payment Methods"
              : t === "orders"
                ? "Payment Orders"
                : "Crypto"}
          </button>
        ))}
      </div>

      {tab === "methods" ? (
        <PaymentMethodsTab />
      ) : tab === "orders" ? (
        <PaymentOrdersTab />
      ) : (
        <AdminCryptoPayment />
      )}
    </div>
  );
}
