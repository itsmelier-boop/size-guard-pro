import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SizeRowData } from "./SizeSegregationForm";

interface SizeRowProps {
  row: SizeRowData;
  index: number;
  applyRule: boolean;
  onUpdate: (id: string, field: keyof Omit<SizeRowData, "id">, value: string) => void;
  onRemove: (id: string) => void;
}

const SizeRow = ({ row, index, applyRule, onUpdate, onRemove }: SizeRowProps) => {
  const filledField = applyRule
    ? (Object.entries(row).find(([key, value]) => key !== "id" && value.trim() !== "")?.[0] as
        | keyof Omit<SizeRowData, "id">
        | undefined)
    : undefined;

  const isFieldDisabled = (field: keyof Omit<SizeRowData, "id">) => {
    return applyRule && filledField && filledField !== field;
  };

  const sizeFields: Array<keyof Omit<SizeRowData, "id">> = [
    "size1",
    "size2",
    "size3",
    "size4",
    "size5",
  ];

  return (
    <div className="grid grid-cols-[auto,repeat(5,1fr),auto] gap-2 items-center p-2 bg-card rounded-lg border border-border hover:border-primary/30 transition-all">
      <div className="w-12 text-center">
        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
      </div>

      {sizeFields.map((field) => {
        const disabled = isFieldDisabled(field);
        const isFilled = row[field].trim() !== "";

        return (
          <TooltipProvider key={field}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Input
                    type="text"
                    value={row[field]}
                    onChange={(e) => onUpdate(row.id, field, e.target.value)}
                    disabled={disabled}
                    placeholder={disabled ? "Disabled" : "Enter value"}
                    className={`
                      transition-all
                      ${disabled ? "opacity-50 cursor-not-allowed bg-muted" : ""}
                      ${isFilled && applyRule ? "border-primary ring-1 ring-primary/20" : ""}
                      ${isFilled && !applyRule ? "border-accent/50" : ""}
                    `}
                  />
                  {isFilled && applyRule && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
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

      <div className="w-12">
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
