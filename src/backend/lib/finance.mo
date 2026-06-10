import Types "../types/finance";
import List "mo:core/List";

module {
  public func getEntries(entries : List.List<Types.FinanceEntry>) : [Types.FinanceEntry] {
    entries.toArray()
  };

  public func addEntry(
    entries : List.List<Types.FinanceEntry>,
    nextId : { var value : Nat },
    entryType : Types.EntryType,
    amount : Nat,
    description : Text,
    date : Text,
    nowNanos : Int,
  ) {
    let id = nextId.value;
    nextId.value += 1;
    entries.add({
      id;
      entryType;
      amount;
      description;
      date;
      createdAt = nowNanos;
    });
  };

  public func deleteEntry(
    entries : List.List<Types.FinanceEntry>,
    id : Nat,
  ) {
    let kept = entries.filter(func(e) { e.id != id });
    entries.clear();
    entries.append(kept);
  };

  public func getSummary(entries : List.List<Types.FinanceEntry>) : Types.FinanceSummary {
    var totalIncome : Nat = 0;
    var totalExpenses : Nat = 0;
    entries.forEach(func(e) {
      switch (e.entryType) {
        case (#income) { totalIncome += e.amount };
        case (#expense) { totalExpenses += e.amount };
      };
    });
    let netBalance : Int = totalIncome.toInt() - totalExpenses.toInt();
    {
      totalIncome;
      totalExpenses;
      netBalance;
      entryCount = entries.size();
    };
  };
};
