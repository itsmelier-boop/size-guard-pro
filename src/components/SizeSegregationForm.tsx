import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import SizeRow from "./SizeRow";

export interface SizeRowData {
  id: string;
  size1: string;
  size2: string;
  size3: string;
  size4: string;
  size5: string;
  calculated?: number;
}

const SizeSegregationForm = () => {
  const [rows, setRows] = useState<SizeRowData[]>([
    { id: "1", size1: "", size2: "", size3: "", size4: "", size5: "" },
  ]);
  const [applyRule, setApplyRule] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "size1",
    "size2",
    "size3",
    "size4",
    "size5",
  ]);

  const addRow = () => {
    const newRow: SizeRowData = {
      id: Date.now().toString(),
      size1: "",
      size2: "",
      size3: "",
      size4: "",
      size5: "",
    };
    setRows([...rows, newRow]);
    toast({
      title: "Row added",
      description: "New size entry row has been added.",
    });
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one row must remain.",
        variant: "destructive",
      });
      return;
    }
    setRows(rows.filter((row) => row.id !== id));
    toast({
      title: "Row removed",
      description: "Size entry row has been removed.",
    });
  };

  const updateRow = (id: string, field: keyof Omit<SizeRowData, "id">, value: string) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          // Calculate sum of numeric values in selected columns
          const sum = selectedColumns.reduce((acc, col) => {
            const val = parseFloat(updatedRow[col as keyof SizeRowData] as string);
            return acc + (isNaN(val) ? 0 : val);
          }, 0);
          updatedRow.calculated = sum;
          return updatedRow;
        }
        return row;
      })
    );
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleSave = () => {
    if (applyRule && selectedColumns.length > 0) {
      const invalidRows = rows.filter((row) => {
        const filledColumns = selectedColumns.filter(
          (col) => (row[col as keyof SizeRowData] as string)?.trim() !== ""
        );
        return filledColumns.length > 1;
      });

      if (invalidRows.length > 0) {
        toast({
          title: "Validation Error",
          description: "Only one selected Size column entry allowed per row when segregation rule is active.",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Data saved successfully",
      description: `${rows.length} row(s) saved with segregation rule ${applyRule ? "enabled" : "disabled"}.`,
    });
    console.log("Saved data:", rows);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Size Segregation Entry Form
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Manage size data with intelligent single-entry validation
              </CardDescription>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Switch
                  id="apply-rule"
                  checked={applyRule}
                  onCheckedChange={setApplyRule}
                  className="data-[state=checked]:bg-primary"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="apply-rule"
                    className="text-sm font-semibold cursor-pointer text-foreground"
                  >
                    Apply Single-Entry Rule
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {applyRule
                      ? "Only one selected size column can be filled per row"
                      : "All size columns are editable"}
                  </p>
                </div>
                {applyRule && (
                  <div className="flex items-center gap-2 text-primary">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Active</span>
                  </div>
                )}
              </div>

              {applyRule && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <Label className="text-sm font-semibold mb-3 block text-foreground">
                    Select Columns for Single-Entry Rule
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {["size1", "size2", "size3", "size4", "size5"].map((col, idx) => (
                      <label
                        key={col}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(col)}
                          onChange={() => toggleColumn(col)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">Size {idx + 1}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[auto,repeat(5,1fr),120px,auto] gap-2 mb-2 px-2">
                  <div className="w-12"></div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Size 1</div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Size 2</div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Size 3</div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Size 4</div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Size 5</div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Calculated</div>
                  <div className="w-12"></div>
                </div>

                <div className="space-y-2">
                  {rows.map((row, index) => (
                    <SizeRow
                      key={row.id}
                      row={row}
                      index={index}
                      applyRule={applyRule}
                      selectedColumns={selectedColumns}
                      onUpdate={updateRow}
                      onRemove={removeRow}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={addRow}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Row
              </Button>
              <Button onClick={handleSave} className="gap-2 ml-auto">
                Save Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SizeSegregationForm;
