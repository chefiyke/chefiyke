import CommonTypes "common";

module {
  public type EntryType = {
    #income;
    #expense;
  };

  public type FinanceEntry = {
    id : Nat;
    entryType : EntryType;
    amount : Nat; // stored in smallest currency unit (e.g. kobo)
    description : Text;
    date : Text; // ISO 8601 date string e.g. "2026-04-21"
    createdAt : CommonTypes.Timestamp;
  };

  // Summary returned by adminGetFinanceSummary
  public type FinanceSummary = {
    totalIncome : Nat;
    totalExpenses : Nat;
    netBalance : Int; // income - expenses (can be negative)
    entryCount : Nat;
  };
};
