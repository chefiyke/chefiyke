import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Download, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  Order,
  OrderStatus,
  SalesFilter,
  SalesStats,
} from "../../backend";
import { SectionHeader, fieldClass, formatDate } from "./AdminShared";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "completed",
  "refunded",
  "failed",
] as unknown as OrderStatus[];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  completed: "bg-green-400/15 text-green-400 border-green-400/30",
  refunded: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`text-[10px] capitalize ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </Badge>
  );
}

function exportCSV(orders: Order[]) {
  const headers = ["Date", "Customer", "Email", "Product", "Amount", "Status"];
  const rows = orders.map((o) => [
    formatDate(o.createdAt),
    o.customerName,
    o.customerEmail,
    o.product,
    o.amount.toString(),
    o.status as unknown as string,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sales-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function AddOrderModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    customerName: string;
    customerEmail: string;
    product: string;
    amount: number;
    status: string;
    notes: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    product: "",
    amount: "",
    status: "pending",
    notes: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="admin.sales.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            New Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">
                Customer Name
              </Label>
              <input
                className={fieldClass()}
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                data-ocid="admin.sales.customer_name_input"
              />
            </div>
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">
                Email
              </Label>
              <input
                className={fieldClass()}
                type="email"
                value={form.customerEmail}
                onChange={(e) => set("customerEmail", e.target.value)}
                data-ocid="admin.sales.customer_email_input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">
                Product
              </Label>
              <input
                className={fieldClass()}
                value={form.product}
                onChange={(e) => set("product", e.target.value)}
                data-ocid="admin.sales.product_input"
              />
            </div>
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">
                Amount (₦)
              </Label>
              <input
                className={fieldClass()}
                type="number"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                data-ocid="admin.sales.amount_input"
              />
            </div>
          </div>
          <div>
            <Label className="font-body text-xs text-muted-foreground mb-1 block">
              Status
            </Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger
                className="bg-background border-input"
                data-ocid="admin.sales.status_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem
                    key={s as unknown as string}
                    value={s as unknown as string}
                  >
                    {s as unknown as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-body text-xs text-muted-foreground mb-1 block">
              Notes
            </Label>
            <Textarea
              className="bg-background border-input text-sm min-h-[60px] resize-none"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              data-ocid="admin.sales.notes_textarea"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              data-ocid="admin.sales.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                onSave({ ...form, amount: Number.parseFloat(form.amount) || 0 })
              }
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.sales.submit_button"
            >
              Save Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminSales() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<{
    status: string;
    product: string;
    fromDate: string;
    toDate: string;
  }>({
    status: "all",
    product: "",
    fromDate: "",
    toDate: "",
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const buildFilter = (): SalesFilter => {
    const f: SalesFilter = {};
    if (filter.status !== "all")
      f.status = filter.status as unknown as OrderStatus;
    if (filter.product) f.product = filter.product;
    if (filter.fromDate)
      f.fromDate =
        BigInt(new Date(filter.fromDate).getTime()) * BigInt(1_000_000);
    if (filter.toDate)
      f.toDate = BigInt(new Date(filter.toDate).getTime()) * BigInt(1_000_000);
    return f;
  };

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin", "orders", filter],
    queryFn: () => actor!.adminGetOrders(buildFilter()),
    enabled,
  });

  const { data: stats } = useQuery<SalesStats>({
    queryKey: ["admin", "salesStats"],
    queryFn: () => actor!.adminGetSalesStats(),
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: (data: {
      customerName: string;
      customerEmail: string;
      product: string;
      amount: number;
      status: string;
      notes: string;
    }) =>
      actor!.adminAddOrder(
        data.customerName,
        data.customerEmail,
        data.product,
        data.amount,
        data.notes,
        null,
        null,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "salesStats"] });
      setModalOpen(false);
      toast.success("Order created");
    },
    onError: () => toast.error("Failed to create order"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      order,
    }: { id: string; status: OrderStatus; order: Order }) =>
      actor!.adminUpdateOrder(
        id,
        order.customerName,
        order.customerEmail,
        order.product,
        order.amount,
        status,
        order.notes,
        order.customerId ?? null,
        order.assignedStaff ?? null,
        order.createdAt,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Status updated");
    },
  });

  return (
    <div data-ocid="admin.sales.section">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Sales Management"
          subtitle="Track orders, payments, and customer history"
        />
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(orders)}
            className="gap-1.5 text-xs border-border"
            data-ocid="admin.sales.export_button"
          >
            <Download size={13} /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs"
            data-ocid="admin.sales.add_button"
          >
            <Plus size={13} /> Add Order
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total Orders", value: Number(stats.totalOrders) },
            {
              label: "Total Revenue",
              value: `₦${stats.totalRevenue.toLocaleString()}`,
            },
            { label: "Pending", value: Number(stats.pendingPayments) },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl px-4 py-3"
            >
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">
                {s.label}
              </p>
              <p className="font-display font-bold text-lg text-[#B8960C] mt-0.5">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end"
        data-ocid="admin.sales.filter_bar"
      >
        <Filter size={14} className="text-muted-foreground self-center" />
        <div className="flex-1 min-w-[140px]">
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            Status
          </Label>
          <Select
            value={filter.status}
            onValueChange={(v) => setFilter((p) => ({ ...p, status: v }))}
          >
            <SelectTrigger
              className="h-8 text-xs bg-background border-input"
              data-ocid="admin.sales.status_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem
                  key={s as unknown as string}
                  value={s as unknown as string}
                >
                  {s as unknown as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            Product Search
          </Label>
          <Input
            className="h-8 text-xs bg-background border-input"
            placeholder="Search product..."
            value={filter.product}
            onChange={(e) =>
              setFilter((p) => ({ ...p, product: e.target.value }))
            }
            data-ocid="admin.sales.product_search_input"
          />
        </div>
        <div>
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            From
          </Label>
          <input
            type="date"
            className={`${fieldClass()} h-8 text-xs`}
            value={filter.fromDate}
            onChange={(e) =>
              setFilter((p) => ({ ...p, fromDate: e.target.value }))
            }
            data-ocid="admin.sales.from_date_input"
          />
        </div>
        <div>
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            To
          </Label>
          <input
            type="date"
            className={`${fieldClass()} h-8 text-xs`}
            value={filter.toDate}
            onChange={(e) =>
              setFilter((p) => ({ ...p, toDate: e.target.value }))
            }
            data-ocid="admin.sales.to_date_input"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl p-8 text-center"
          data-ocid="admin.sales.loading_state"
        >
          <p className="font-body text-sm text-muted-foreground">
            Loading orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-10 text-center"
          data-ocid="admin.sales.empty_state"
        >
          <p className="font-body text-sm text-muted-foreground">
            No orders found for the selected filters.
          </p>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.sales.table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Customer", "Product", "Amount", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <>
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === order.id ? null : order.id)
                      }
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        setExpandedId(expandedId === order.id ? null : order.id)
                      }
                      tabIndex={0}
                      data-ocid={`admin.sales.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-body text-xs text-foreground">
                          {order.customerName}
                        </p>
                        <p className="font-body text-[11px] text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-foreground">
                        {order.product}
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-[#B8960C] font-semibold">
                        ₦{order.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={order.status as unknown as string}
                          onValueChange={(v) => {
                            updateStatusMutation.mutate({
                              id: order.id,
                              status: v as unknown as OrderStatus,
                              order,
                            });
                          }}
                        >
                          <SelectTrigger
                            className="h-7 text-xs border-0 bg-transparent p-0 w-auto gap-1 focus:ring-0"
                            onClick={(e) => e.stopPropagation()}
                            data-ocid={`admin.sales.status_select.${i + 1}`}
                          >
                            <StatusBadge
                              status={order.status as unknown as string}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem
                                key={s as unknown as string}
                                value={s as unknown as string}
                              >
                                {s as unknown as string}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {expandedId === order.id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-muted/10">
                        <td colSpan={6} className="px-6 py-4">
                          <p className="font-body text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                            Notes
                          </p>
                          <p className="font-body text-sm text-foreground">
                            {order.notes || "—"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => addMutation.mutate(data)}
      />
    </div>
  );
}
