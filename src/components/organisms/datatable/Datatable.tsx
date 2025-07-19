"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Plus,
} from "lucide-react";

// Types
export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  className?: string;
}

export interface ActionButton<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T, index: number) => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    type: "checkbox" | "radio";
    selectedRowKeys: (string | number)[];
    onChange: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  actions?: ActionButton<T>[];
  searchable?: boolean;
  exportable?: boolean;
  refreshable?: boolean;
  addButton?: {
    label: string;
    onClick: () => void;
  };
  toolbar?: React.ReactNode;
  emptyText?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  sticky?: boolean;
  scroll?: { x?: number; y?: number };
  rowKey?: string | ((record: T) => string);
  onRow?: (
    record: T,
    index: number
  ) => React.HTMLAttributes<HTMLTableRowElement>;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  selection,
  actions,
  searchable = true,
  exportable = false,
  refreshable = false,
  addButton,
  toolbar,
  emptyText = "Veri bulunamadı",
  className = "",
  size = "medium",
  bordered = true,
  striped = true,
  hoverable = true,
  sticky = false,
  scroll,
  rowKey = "id",
  onRow,
}: DataTableProps<T>) {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Get row key
  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (typeof rowKey === "function") {
        return rowKey(record);
      }
      return record[rowKey] || index.toString();
    },
    [rowKey]
  );

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm && searchable) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) =>
          String(item[key]).toLowerCase().includes(String(value).toLowerCase())
        );
      }
    });

    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchable, filters, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;

    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination]);

  // Handlers
  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const key = column.dataIndex || column.key;
    let direction: "asc" | "desc" = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (pagination) {
      pagination.onChange(1, pagination.pageSize);
    }
  };

  const handleExport = () => {
    const headers = columns.map((col) => col.title).join(",");
    const rows = processedData
      .map((item) =>
        columns
          .map((col) => {
            const value = item[col.dataIndex || col.key];
            return `"${String(value || "").replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `data-${new Date().getTime()}.csv`;
    link.click();
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilters({});
    setSortConfig(null);
    if (selection) {
      selection.onChange([], []);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selection) return;

    if (checked) {
      const allKeys = paginatedData.map((item, index) =>
        getRowKey(item, index)
      );
      selection.onChange(allKeys, paginatedData);
    } else {
      selection.onChange([], []);
    }
  };

  const handleSelectRow = (record: T, index: number, checked: boolean) => {
    if (!selection) return;

    const key = getRowKey(record, index);
    let newSelectedKeys = [...selection.selectedRowKeys];
    let newSelectedRows: T[] = [];

    if (selection.type === "radio") {
      newSelectedKeys = checked ? [key] : [];
      newSelectedRows = checked ? [record] : [];
    } else {
      if (checked) {
        newSelectedKeys.push(key);
      } else {
        newSelectedKeys = newSelectedKeys.filter((k) => k !== key);
      }

      newSelectedRows = data.filter((item, idx) =>
        newSelectedKeys.includes(getRowKey(item, idx))
      );
    }

    selection.onChange(newSelectedKeys, newSelectedRows);
  };

  // Size classes
  const sizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const paddingClasses = {
    small: "px-2 py-1",
    medium: "px-4 py-2",
    large: "px-6 py-3",
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Toolbar */}
      {(searchable || exportable || refreshable || addButton || toolbar) && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>
              )}
              {toolbar}
            </div>

            <div className="flex items-center gap-2">
              {refreshable && (
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded transition-colors"
                  title="Yenile"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              {exportable && (
                <button
                  onClick={handleExport}
                  className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded transition-colors"
                  title="Dışa Aktar"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {addButton && (
                <button
                  onClick={addButton.onClick}
                  className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addButton.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={`overflow-auto ${scroll?.x ? "overflow-x-auto" : ""}`}
        style={{ maxHeight: scroll?.y }}
      >
        <table className="w-full">
          {/* Header */}
          <thead className={`bg-gray-50 ${sticky ? "sticky top-0 z-10" : ""}`}>
            <tr>
              {selection && (
                <th
                  className={`${paddingClasses[size]} text-left border-b border-gray-200`}
                >
                  {selection.type === "checkbox" && (
                    <input
                      type="checkbox"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((item, index) =>
                          selection.selectedRowKeys.includes(
                            getRowKey(item, index)
                          )
                        )
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  )}
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${paddingClasses[size]} ${
                    sizeClasses[size]
                  } font-medium text-gray-900 border-b border-gray-200 ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                      ? "text-right"
                      : "text-left"
                  } ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  } ${column.className || ""}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortConfig?.key ===
                              (column.dataIndex || column.key) &&
                            sortConfig.direction === "asc"
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig?.key ===
                              (column.dataIndex || column.key) &&
                            sortConfig.direction === "desc"
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {actions && actions.length > 0 && (
                <th
                  className={`${paddingClasses[size]} text-center border-b border-gray-200`}
                >
                  İşlemler
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)
                  }
                  className="p-8 text-center"
                >
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-amber-600 animate-spin mr-2" />
                    <span className="text-gray-600">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)
                  }
                  className="p-8 text-center text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const rowKey = getRowKey(record, index);
                const isSelected = selection?.selectedRowKeys.includes(rowKey);
                const rowProps = onRow?.(record, index) || {};

                return (
                  <tr
                    key={rowKey}
                    className={`
                      ${bordered ? "border-b border-gray-200" : ""}
                      ${striped && index % 2 === 1 ? "bg-gray-50" : ""}
                      ${hoverable ? "hover:bg-gray-50" : ""}
                      ${isSelected ? "bg-amber-50" : ""}
                    `}
                    {...rowProps}
                  >
                    {selection && (
                      <td className={paddingClasses[size]}>
                        <input
                          type={selection.type}
                          name={
                            selection.type === "radio"
                              ? "table-selection"
                              : undefined
                          }
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(record, index, e.target.checked)
                          }
                          disabled={
                            selection.getCheckboxProps?.(record)?.disabled
                          }
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                    )}

                    {columns.map((column) => {
                      const value = record[column.dataIndex || column.key];
                      const content = column.render
                        ? column.render(value, record, index)
                        : value;

                      return (
                        <td
                          key={column.key}
                          className={`${paddingClasses[size]} ${
                            sizeClasses[size]
                          } ${
                            column.align === "center"
                              ? "text-center"
                              : column.align === "right"
                              ? "text-right"
                              : "text-left"
                          } ${column.className || ""}`}
                        >
                          {content}
                        </td>
                      );
                    })}

                    {actions && actions.length > 0 && (
                      <td className={`${paddingClasses[size]} text-center`}>
                        <div className="flex items-center justify-center gap-1">
                          {actions
                            .filter((action) => !action.hidden?.(record))
                            .map((action) => {
                              const disabled = action.disabled?.(record);
                              const variantClasses = {
                                primary: "text-amber-600 hover:text-amber-700",
                                secondary: "text-gray-600 hover:text-gray-700",
                                danger: "text-red-600 hover:text-red-700",
                                success: "text-green-600 hover:text-green-700",
                              };

                              return (
                                <button
                                  key={action.key}
                                  onClick={() => action.onClick(record, index)}
                                  disabled={disabled}
                                  className={`
                                    p-1 rounded transition-colors
                                    ${
                                      disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-gray-100"
                                    }
                                    ${
                                      variantClasses[
                                        action.variant || "secondary"
                                      ]
                                    }
                                    ${action.className || ""}
                                  `}
                                  title={action.label}
                                >
                                  {action.icon}
                                </button>
                              );
                            })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam {pagination.total} kayıt, {pagination.current} /{" "}
            {Math.ceil(pagination.total / pagination.pageSize)} sayfa
          </div>

          <div className="flex items-center gap-2">
            {pagination.showSizeChanger && (
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  pagination.onChange(1, parseInt(e.target.value))
                }
                className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map(
                  (size) => (
                    <option key={size} value={size}>
                      {size} / sayfa
                    </option>
                  )
                )}
              </select>
            )}

            <button
              onClick={() =>
                pagination.onChange(pagination.current - 1, pagination.pageSize)
              }
              disabled={pagination.current <= 1}
              className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-sm">{pagination.current}</span>

            <button
              onClick={() =>
                pagination.onChange(pagination.current + 1, pagination.pageSize)
              }
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
