import { useState } from "react";
import { Plus, Trash2, AlertCircle, X, Layers, Filter, ShoppingBag, Package, Box, Boxes, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import SizeRow from "./SizeRow";

export interface ColumnGroup {
  id: string;
  name: string;
  columns: string[];
  enabled: boolean;
  icon?: string;
}

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
  const [columnGroups, setColumnGroups] = useState<ColumnGroup[]>([
    {
      id: "1",
      name: "Group 1",
      columns: ["size1", "size2", "size3", "size4", "size5"],
      enabled: true,
      icon: "Layers",
    },
  ]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const getGroupIcon = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      Layers, Filter, ShoppingBag, Package, Box, Boxes
    };
    return iconMap[iconName || "Layers"] || Layers;
  };

  const addGroup = () => {
    const icons = ["Layers", "Filter", "ShoppingBag", "Package", "Box", "Boxes"];
    const newGroup: ColumnGroup = {
      id: Date.now().toString(),
      name: `Group ${columnGroups.length + 1}`,
      columns: [],
      enabled: true,
      icon: icons[columnGroups.length % icons.length],
    };
    setColumnGroups([...columnGroups, newGroup]);
    toast({
      title: "Group added",
      description: "New column group has been created.",
    });
  };

  const removeGroup = (id: string) => {
    if (columnGroups.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one group must remain.",
        variant: "destructive",
      });
      return;
    }
    setColumnGroups(columnGroups.filter((group) => group.id !== id));
    toast({
      title: "Group removed",
      description: "Column group has been removed.",
    });
  };

  const toggleGroupEnabled = (id: string) => {
    setColumnGroups(
      columnGroups.map((group) =>
        group.id === id ? { ...group, enabled: !group.enabled } : group
      )
    );
  };

  const toggleColumnInGroup = (groupId: string, column: string) => {
    setColumnGroups(
      columnGroups.map((group) => {
        if (group.id === groupId) {
          const newColumns = group.columns.includes(column)
            ? group.columns.filter((col) => col !== column)
            : [...group.columns, column];
          return { ...group, columns: newColumns };
        }
        return group;
      })
    );
  };

  const updateGroupName = (id: string, name: string) => {
    setColumnGroups(
      columnGroups.map((group) =>
        group.id === id ? { ...group, name } : group
      )
    );
  };

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
          // Calculate sum of all numeric values
          const sum = ["size1", "size2", "size3", "size4", "size5"].reduce((acc, col) => {
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

  const handleSave = () => {
    // Validate each enabled group
    for (const group of columnGroups.filter((g) => g.enabled)) {
      const invalidRows = rows.filter((row) => {
        const filledColumns = group.columns.filter(
          (col) => (row[col as keyof SizeRowData] as string)?.trim() !== ""
        );
        return filledColumns.length > 1;
      });

      if (invalidRows.length > 0) {
        toast({
          title: "Validation Error",
          description: `Only one column entry allowed per row in "${group.name}" when segregation rule is active.`,
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Data saved successfully",
      description: `${rows.length} row(s) saved with ${columnGroups.filter((g) => g.enabled).length} active group(s).`,
    });
    console.log("Saved data:", rows);
  };

  const calculateColumnSum = (column: keyof Omit<SizeRowData, "id" | "calculated">) => {
    return rows.reduce((sum, row) => {
      const val = parseFloat(row[column] as string);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-foreground">
                  Size Segregation Entry Form
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Manage size data with intelligent single-entry validation
                </CardDescription>
              </div>
              
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    Groups ({columnGroups.filter(g => g.enabled).length})
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Column Group Configuration</SheetTitle>
                    <SheetDescription>
                      Create and manage groups with single-entry rules for different column combinations
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-4">
                    <Button onClick={addGroup} variant="outline" size="sm" className="gap-2 w-full">
                      <Plus className="h-4 w-4" />
                      Add New Group
                    </Button>

                    <div className="space-y-3">
                      {columnGroups.map((group) => {
                        const GroupIcon = getGroupIcon(group.icon);
                        
                        return (
                          <div
                            key={group.id}
                            className="p-4 bg-muted/30 rounded-lg border border-border space-y-3"
                          >
                            <div className="flex items-center gap-3">
                              <Switch
                                id={`group-${group.id}`}
                                checked={group.enabled}
                                onCheckedChange={() => toggleGroupEnabled(group.id)}
                                className="data-[state=checked]:bg-primary"
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <GroupIcon className="h-4 w-4 text-primary flex-shrink-0" />
                                <input
                                  type="text"
                                  value={group.name}
                                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                                  className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                              {group.enabled && (
                                <div className="flex items-center gap-2 text-primary">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-xs font-medium">Active</span>
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeGroup(group.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {group.enabled && (
                              <div className="pl-8">
                                <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                                  Select columns for this group's single-entry rule
                                </Label>
                                <div className="flex flex-wrap gap-3">
                                  {["size1", "size2", "size3", "size4", "size5"].map((col, idx) => (
                                    <label
                                      key={col}
                                      className="flex items-center gap-2 cursor-pointer text-sm"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={group.columns.includes(col)}
                                        onChange={() => toggleColumnInGroup(group.id, col)}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                      />
                                      <span className="text-foreground">Size {idx + 1}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
                      columnGroups={columnGroups}
                      onUpdate={updateRow}
                      onRemove={removeRow}
                    />
                  ))}
                </div>

                {/* Column Totals */}
                <div className="grid grid-cols-[auto,repeat(5,1fr),120px,auto] gap-2 items-center p-2 bg-primary/5 rounded-lg border border-primary/20 mt-4">
                  <div className="w-12 text-center">
                    <span className="text-sm font-bold text-primary">Σ</span>
                  </div>
                  {["size1", "size2", "size3", "size4", "size5"].map((col) => (
                    <div key={col} className="flex items-center justify-center bg-primary/10 rounded-md h-10 px-3">
                      <span className="text-sm font-bold text-primary">
                        {calculateColumnSum(col as keyof Omit<SizeRowData, "id" | "calculated">).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-center bg-primary/10 rounded-md h-10 px-3">
                    <span className="text-sm font-bold text-primary">
                      {rows.reduce((sum, row) => sum + (row.calculated || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-12"></div>
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
