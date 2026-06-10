import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EntryType, createActor } from "../../backend";
import type { FinanceEntry, FinanceSummary } from "../../backend";
import {
  FormCard,
  SectionHeader,
  fieldClass,
  formatCurrency,
  formatDate,
} from "./AdminShared";

export function AdminFinance() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const { data: summary } = useQuery<FinanceSummary>({
    queryKey: ["admin", "finance-summary"],
    queryFn: () => actor!.adminGetFinanceSummary(),
    enabled,
  });

  const { data: entries = [], isLoading } = useQuery<FinanceEntry[]>({
    queryKey: ["admin", "finance-entries"],
    queryFn: () => actor!.adminGetFinanceEntries(),
    enabled,
  });

  const [form, setForm] = useState({
    type: EntryType.income,
    amount: "",
    description: "",
    date: "",
  });

  const { mutate: addEntry, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.adminAddFinanceEntry(
        form.type,
        BigInt(Math.round(Number(form.amount) * 100)),
        form.description,
        form.date,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "finance-entries"] });
      qc.invalidateQueries({ queryKey: ["admin", "finance-summary"] });
      setForm({
        type: EntryType.income,
        amount: "",
        description: "",
        date: "",
      });
      toast.success("Entry added");
    },
    onError: () => toast.error("Failed to add entry"),
  });

  const { mutate: deleteEntry } = useMutation({
    mutationFn: (id: bigint) => actor!.adminDeleteFinanceEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "finance-entries"] });
      qc.invalidateQueries({ queryKey: ["admin", "finance-summary"] });
      toast.success("Entry deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const sorted = [...entries].sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1,
  );

  return (
    <div data-ocid="admin.finance.section">
      <SectionHeader title="Finance" subtitle="Track income and expenses" />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={15} className="text-green-400" />
              <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                Income
              </span>
            </div>
            <p className="font-display font-bold text-xl text-green-400">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={15} className="text-destructive" />
              <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                Expenses
              </span>
            </div>
            <p className="font-display font-bold text-xl text-destructive">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                Net Balance
              </span>
            </div>
            <p
              className={`font-display font-bold text-xl ${Number(summary.netBalance) >= 0 ? "text-primary" : "text-destructive"}`}
            >
              {formatCurrency(summary.netBalance)}
            </p>
          </div>
        </div>
      )}

      <FormCard title="Add Entry">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[EntryType.income, EntryType.expense].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex-1 py-2 rounded-lg font-body text-sm font-medium border transition-colors ${form.type === t ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input text-muted-foreground hover:text-foreground"}`}
                data-ocid={`admin.finance.type_${t}`}
              >
                {t === EntryType.income ? "Income" : "Expense"}
              </button>
            ))}
          </div>
          <div>
            <label
              htmlFor="finance-amount"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Amount (₦)
            </label>
            <input
              id="finance-amount"
              type="number"
              className={fieldClass()}
              placeholder="e.g. 50000"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              data-ocid="admin.finance.amount_input"
            />
          </div>
          <div>
            <label
              htmlFor="finance-desc"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Description
            </label>
            <input
              id="finance-desc"
              type="text"
              className={fieldClass()}
              placeholder="What is this for?"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="admin.finance.desc_input"
            />
          </div>
          <div>
            <label
              htmlFor="finance-date"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Date
            </label>
            <input
              id="finance-date"
              type="date"
              className={fieldClass()}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              data-ocid="admin.finance.date_input"
            />
          </div>
          <Button
            type="button"
            disabled={
              isPending || !form.amount || !form.description || !form.date
            }
            onClick={() => addEntry()}
            className="w-full gap-2"
            data-ocid="admin.finance.add_button"
          >
            <Plus size={15} /> {isPending ? "Adding…" : "Add Entry"}
          </Button>
        </div>
      </FormCard>

      <div className="space-y-2">
        {isLoading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : sorted.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.finance.empty_state"
          >
            <p className="font-body text-sm text-muted-foreground">
              No finance entries yet.
            </p>
          </div>
        ) : (
          sorted.map((entry, i) => (
            <div
              key={String(entry.id)}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3"
              data-ocid={`admin.finance.item.${i + 1}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs px-1.5 py-0.5 rounded ${entry.entryType === EntryType.income ? "bg-green-400/10 text-green-400" : "bg-destructive/10 text-destructive"}`}
                  >
                    {entry.entryType}
                  </span>
                  <span className="font-body text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                </div>
                <p className="font-body text-sm text-foreground mt-1 truncate">
                  {entry.description}
                </p>
                <p
                  className={`font-display font-semibold text-sm mt-0.5 ${entry.entryType === EntryType.income ? "text-green-400" : "text-destructive"}`}
                >
                  {entry.entryType === EntryType.income ? "+" : "-"}
                  {formatCurrency(entry.amount / 100n)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteEntry(entry.id)}
                aria-label="Delete entry"
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                data-ocid={`admin.finance.delete.${i + 1}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
