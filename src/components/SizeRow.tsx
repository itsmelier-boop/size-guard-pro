import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SizeRowData, ColumnGroup } from "./SizeSegregationForm";

interface SizeRowProps {
  row: SizeRowData;
  index: number;
  columnGroups: ColumnGroup[];
  onUpdate: (id: string, field: keyof Omit<SizeRowData, "id">, value: string) => void;
  onRemove: (id: string) => void;
}

const SizeRow = ({ row, index, columnGroups, onUpdate, onRemove }: SizeRowProps) => {
  const isFieldDisabled = (field: keyof Omit<SizeRowData, "id" | "calculated">) => {
    // Check each enabled group
    for (const group of columnGroups.filter((g) => g.enabled)) {
      if (!group.columns.includes(field)) continue;

      // Find if any other column in this group is filled
      const filledColumn = group.columns.find(
        (col) =>
          col !== field &&
          typeof row[col as keyof SizeRowData] === "string" &&
          (row[col as keyof SizeRowData] as string).trim() !== ""
      );

      if (filledColumn) return true;
    }
    return false;
  };

  const sizeFields: Array<"size1" | "size2" | "size3" | "size4" | "size5"> = [
    "size1",
    "size2",
    "size3",
    "size4",
    "size5",
  ];

  return (
    <div className="grid grid-cols-[auto,repeat(5,1fr),120px,auto] gap-0 items-center bg-card border border-border hover:border-primary/30 transition-all">
      <div className="w-12 text-center py-3 border-r border-border">
        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
      </div>

      {sizeFields.map((field, idx) => {
        const disabled = isFieldDisabled(field);
        const fieldValue = row[field];
        const isFilled = typeof fieldValue === "string" && fieldValue.trim() !== "";
        
        // Check if this field is in any enabled group
        const inActiveGroup = columnGroups
          .filter((g) => g.enabled)
          .some((g) => g.columns.includes(field));

        return (
          <TooltipProvider key={field}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`relative p-2 ${idx < 4 ? 'border-r border-border' : ''}`}>
                  <Input
                    type="text"
                    value={row[field]}
                    onChange={(e) => onUpdate(row.id, field, e.target.value)}
                    disabled={disabled}
                    placeholder={disabled ? "Disabled" : "Enter value"}
                    className={`
                      transition-all border-0 focus-visible:ring-1
                      ${disabled ? "opacity-50 cursor-not-allowed bg-muted" : ""}
                      ${isFilled && inActiveGroup ? "bg-primary/5 ring-1 ring-primary/20" : ""}
                      ${isFilled && !inActiveGroup ? "bg-accent/5" : ""}
                    `}
                  />
                  {isFilled && inActiveGroup && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </TooltipTrigger>
              {disabled && (
                <TooltipContent>
                  <p className="text-xs">Clear other fields to enable</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}

      <div className="flex items-center justify-center bg-muted/30 h-full px-3 border-r border-border">
        <span className="text-sm font-semibold text-foreground">
          {row.calculated?.toFixed(2) || "0.00"}
        </span>
      </div>

      <div className="w-12 flex items-center justify-center py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(row.id)}
          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SizeRow;
