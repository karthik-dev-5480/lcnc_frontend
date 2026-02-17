"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Columns, Link2, RefreshCw, X, 
  Edit2, Trash2, CheckCircle2, AlertCircle, ChevronDown 
} from "lucide-react";

// Modular Imports
import { apiService } from "../services/api-service";
import { DataTable, DataColumn, DataRelationship } from "../types/data-model";

const INITIAL_COLUMN_STATE: DataColumn = {
  columnName: "",
  dataType: "VARCHAR",
  length: 255,
  precision: 0,
  scale: 0,
  isPrimaryKey: false,
  isIdentity: false,
  isRequired: false,
  isUnique: false,
  columnOrder: 1
};

const INITIAL_RELATION_STATE = {
  sourceTableId: "",
  sourceColumnId: "", 
  targetTableId: "",
  targetColumnId: ""  
};

export default function DataModeler() {
  // --- UI & Data State ---
  const [tables, setTables] = useState<DataTable[]>([]);
  const [relationships, setRelationships] = useState<DataRelationship[]>([]); 
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- Modal & Form State ---
  const [modalMode, setModalMode] = useState<"table" | "column" | "relation" | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableDescription, setTableDescription] = useState(""); 
  const [columnData, setColumnData] = useState<DataColumn>(INITIAL_COLUMN_STATE);
  const [relationData, setRelationData] = useState(INITIAL_RELATION_STATE);

  // --- Helper: Get Table Name ---
  const getTableName = (id: number | string | null | undefined) => {
    // 1. Safety check: If the ID passed in is null/undefined
    if (!id) return "Unknown";

    // 2. Find table: Ensure table exists and has an ID before comparing
    const foundTable = tables.find(t => 
      t && t.id && t.id.toString() === id.toString()
    );

    return foundTable?.tableName || "Unknown";
  };

  // --- Helper: Get Columns ---
  const getColumnsForTable = (tableId: string) => {
    const table = tables.find(t => t.id.toString() === tableId.toString());
    return table?.columns || [];
  };

  const selectedTable = tables.find(t => t.id.toString() === selectedTableId);

  // --- Helper: Notifications ---
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- API Actions ---

  // Unified Data Loading (Tables + Relationships)
  const loadData = useCallback(async () => { 
    setLoading(true);
    try {
      const [tablesData, relData] = await Promise.all([
        apiService.getTables(),
        apiService.getRelationships() // Ensure this exists in your apiService
      ]);
      setTables(tablesData);
      setRelationships(relData);
    } catch (err: any) {
      showToast(err.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync Schema
  const handleSync = async () => {
    if (!selectedTableId) return;
    setIsSyncing(true);
    try {
      const message = await apiService.syncTable(selectedTableId);
      showToast(message, "success");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Sync failed", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete Column
  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm("Are you sure you want to delete this column?")) return;
    try {
      await apiService.deleteColumn(columnId);
      showToast("Column deleted", "success");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  // Delete Relationship
  const handleDeleteRelation = async (relId: number) => {
    if(!confirm("Delete this relationship?")) return;
    try {
        await apiService.deleteRelationship(relId);
        showToast("Relationship deleted", "success");
        await loadData();
    } catch(err: any) {
        showToast(err.message, "error");
    }
  };

  // Map Relationship (Create)
  const handleMapRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Strict Validation
    if (!relationData.sourceTableId || !relationData.sourceColumnId || 
        !relationData.targetTableId || !relationData.targetColumnId) {
        showToast("Please select all fields", "error");
        return;
    }

    // 2. Fetch Table Objects for Naming (Safe check)
    const sourceT = tables.find(t => t.id.toString() === relationData.sourceTableId);
    const targetT = tables.find(t => t.id.toString() === relationData.targetTableId);

    if (!sourceT || !targetT) {
      showToast("Invalid table selection", "error");
      return;
    }

    // 3. Construct Payload
    const payload = {
      fkName: `FK_${sourceT.tableName}_${targetT.tableName}`,
      sourceTableId: parseInt(relationData.sourceTableId, 10),
      sourceColumnId: parseInt(relationData.sourceColumnId, 10),
      targetTableId: parseInt(relationData.targetTableId, 10),
      targetColumnId: parseInt(relationData.targetColumnId, 10),
    };

    console.log("Sending Payload:", payload);

    try {
      await apiService.createRelationship(payload);
      showToast("Relationship mapped successfully", "success");
      closeModals();
      await loadData(); 
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Generic Submit Handler (Tables, Columns)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "table") {
        await apiService.createTable({ tableName, description: tableDescription });
      } else if (modalMode === "column") {
        if (editingColumnId) {
          await apiService.updateColumn(editingColumnId, columnData);
        } else {
          await apiService.createColumn(selectedTableId, columnData);
        }
      } else if (modalMode === "relation") {
        await handleMapRelationship(e);
        return; 
      }
      showToast("Operation successful", "success");
      closeModals();
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Request failed", "error");
    }
  };

  // --- UI Logic ---
  const handleEditColumn = (col: DataColumn) => {
    setEditingColumnId(col.id || null);
    setColumnData({ ...col });
    setModalMode("column");
  };

  const handleDataTypeChange = (type: string) => {
    let updates: Partial<DataColumn> = { dataType: type };
    if (type === "UNIQUEIDENTIFIER") updates.length = 36;
    else if (type === "VARCHAR") updates.length = 255;
    setColumnData(prev => ({ ...prev, ...updates }));
  };

  const closeModals = () => {
    setModalMode(null);
    setEditingColumnId(null);
    setTableName("");
    setTableDescription("");
    setRelationData(INITIAL_RELATION_STATE);
    setColumnData({ 
      ...INITIAL_COLUMN_STATE, 
      columnOrder: (selectedTable?.columns?.length || 0) + 1 
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0a0a0a] p-8 text-white font-sans">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* HEADER BAR */}
        <div className="bg-[#111] border border-[#222] p-6 rounded-[28px] flex items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-6 flex-1">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold ml-1">Data Source</label>
              <div className="relative">
                <select 
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1a1a] text-white">Select a table...</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id.toString()} className="bg-[#1a1a1a] text-white">
                      {t.tableName}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
              </div>
            </div>
            
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModalMode("table")} className="p-3 bg-white text-black rounded-xl hover:bg-[#e5e5e5] transition-all active:scale-95 shadow-lg shadow-white/5">
                <Plus size={20} />
              </button>
              <button 
                onClick={handleSync} 
                disabled={!selectedTableId || isSyncing}
                className={`p-3 bg-[#1a1a1a] border border-[#333] text-white rounded-xl hover:bg-[#222] transition-all disabled:opacity-30 ${isSyncing ? 'cursor-not-allowed' : ''}`}
              >
                <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-tighter">Data Modeler</h1>
            {selectedTable?.description && <p className="text-[#555] text-xs italic mt-1">{selectedTable.description}</p>}
          </div>
        </div>

        {/* TOAST NOTIFICATIONS */}
        {toast && (
          <div className={`flex items-center gap-3 border p-4 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success" ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-red-500/10 border-red-500/50 text-red-500"
          }`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-xs font-bold uppercase tracking-widest">{toast.message}</p>
          </div>
        )}

        {/* GRIDS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columns Grid */}
          <section className="bg-[#111] border border-[#222] rounded-[32px] overflow-hidden flex flex-col shadow-2xl min-h-[450px]">
            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Columns size={18} /></div>
                <h2 className="font-bold tracking-tight">Columns</h2>
              </div>
              <button 
                onClick={() => setModalMode("column")} 
                disabled={!selectedTableId} 
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-30"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f0f0f] text-[10px] uppercase tracking-widest text-[#444] font-bold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {selectedTable?.columns?.map((col: DataColumn) => (
                    <tr key={col.id} className="group hover:bg-[#161616] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">
                        {col.columnName}
                        {col.isPrimaryKey && <span className="ml-2 text-[8px] text-yellow-500 border border-yellow-500/30 px-1 rounded uppercase">PK</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-[#222] px-2 py-1 rounded text-[#888] font-mono">
                          {col.dataType}{col.length ? `(${col.length})` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditColumn(col)} className="p-2 text-[#555] hover:text-white transition-colors">
                            <Edit2 size={14}/>
                          </button>
                          <button onClick={() => col.id && handleDeleteColumn(col.id)} className="p-2 text-[#555] hover:text-red-500 transition-colors">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!selectedTableId && <div className="h-full flex flex-col items-center justify-center p-10 opacity-20"><Columns size={40}/><p className="text-[10px] font-bold mt-4 uppercase tracking-widest">Select a table to begin</p></div>}
            </div>
          </section>

          {/* Relationships Grid */}
          <section className="bg-[#111] border border-[#222] rounded-[32px] overflow-hidden flex flex-col shadow-2xl min-h-[450px]">
            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Link2 size={18} /></div>
                <h2 className="font-bold tracking-tight">Relationships</h2>
              </div>
              <button 
                onClick={() => {
                  setRelationData(prev => ({ ...prev, sourceTableId: selectedTableId }));
                  setModalMode("relation");
                }} 
                disabled={!selectedTableId} 
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-30"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            
            {/* RELATIONSHIP TABLE */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f0f0f] text-[10px] uppercase tracking-widest text-[#444] font-bold">
                  <tr>
                    <th className="px-6 py-4">Source Table</th>
                    <th className="px-6 py-4">Target Table</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {relationships.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-10 text-[#555] text-xs">No relationships defined</td></tr>
                  ) : (
                    relationships.map((rel: any) => (
                      <tr key={rel.id} className="group hover:bg-[#161616] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#888]">
                          <span className="text-white font-medium">{getTableName(rel.sourceTableId)}</span>
                          <span className="mx-2 text-[#444]">→</span>
                          <span className="text-[10px] border border-[#333] px-1 rounded">FK</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#888]">
                          <span className="text-white font-medium">{getTableName(rel.targetTableId)}</span>
                          <span className="mx-2 text-[#444]">→</span>
                          <span className="text-[10px] border border-[#333] px-1 rounded">PK</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteRelation(rel.id)} className="p-2 text-[#555] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* POPUP MODAL SYSTEM */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`bg-[#111] border border-[#222] w-full ${modalMode === 'column' ? 'max-w-2xl' : 'max-w-md'} rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
            
            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
              <h2 className="text-lg font-bold text-white uppercase tracking-tighter">
                {editingColumnId ? 'Edit' : 'Add'} {modalMode}
              </h2>
              <button onClick={closeModals} className="p-2 text-[#555] hover:text-white transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {modalMode === "table" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">Table Name</label>
                    <input autoFocus type="text" required value={tableName} onChange={(e) => setTableName(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-white/20" placeholder="Users" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">Description</label>
                    <textarea value={tableDescription} onChange={(e) => setTableDescription(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl px-5 py-4 text-white focus:outline-none min-h-[100px] resize-none" placeholder="Store user profiles" />
                  </div>
                </div>
              )}

              {modalMode === "column" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">Column Name</label>
                      <input required type="text" value={columnData.columnName} onChange={(e) => setColumnData({...columnData, columnName: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">Data Type</label>
                      <select 
                        value={columnData.dataType} 
                        onChange={(e) => handleDataTypeChange(e.target.value)} 
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="UNIQUEIDENTIFIER">UUID</option>
                        <option value="DECIMAL">DECIMAL</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="DATETIME">DATETIME</option>
                        <option value="TEXT">TEXT</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    {['isPrimaryKey', 'isIdentity', 'isRequired', 'isUnique'].map((id) => (
                      <label key={id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={(columnData as any)[id]} 
                          onChange={(e) => setColumnData({...columnData, [id]: e.target.checked})}
                          className="w-4 h-4 rounded border-[#444] bg-[#1a1a1a] accent-white" 
                        />
                        <span className="text-[9px] uppercase font-bold text-[#555] group-hover:text-white transition-colors">
                          {id.replace('is', '').replace(/([A-Z])/g, ' $1')}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {['length', 'precision', 'scale', 'columnOrder'].map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">{field}</label>
                        <input 
                          type="number" 
                          value={(columnData as any)[field]} 
                          onChange={(e) => setColumnData({...columnData, [field]: parseInt(e.target.value) || 0})} 
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalMode === "relation" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    
                    {/* SOURCE SECTION */}
                    <div className="space-y-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                      <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Source (Foreign Key)</h3>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] text-[#555] uppercase font-bold">Table</label>
                        <select 
                          value={relationData.sourceTableId}
                          disabled 
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white outline-none opacity-50 cursor-not-allowed"
                        >
                          <option value="">Select Table...</option>
                          {tables.map(t => <option key={t.id} value={t.id.toString()}>{t.tableName}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-[#555] uppercase font-bold">Column</label>
                        <select 
                          disabled={!relationData.sourceTableId}
                          value={relationData.sourceColumnId}
                          onChange={(e) => setRelationData({
                            ...relationData, 
                            sourceColumnId: e.target.value 
                          })}
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white outline-none disabled:opacity-30"
                        >
                          <option value="">Select Column...</option>
                          {getColumnsForTable(relationData.sourceTableId).map((col: any) => (
                            <option key={col.id} value={col.id.toString()}>{col.columnName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* TARGET SECTION */}
                    <div className="space-y-4 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                      <h3 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Target (Primary Key)</h3>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] text-[#555] uppercase font-bold">Table</label>
                        <select 
                          value={relationData.targetTableId}
                          onChange={(e) => setRelationData({
                            ...relationData, 
                            targetTableId: e.target.value, 
                            targetColumnId: "" 
                          })}
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="">Select Table...</option>
                          {tables.map(t => <option key={t.id} value={t.id.toString()}>{t.tableName}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-[#555] uppercase font-bold">Column</label>
                        <select 
                          disabled={!relationData.targetTableId}
                          value={relationData.targetColumnId} 
                          onChange={(e) => setRelationData({
                            ...relationData, 
                            targetColumnId: e.target.value 
                          })}
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white outline-none disabled:opacity-30"
                        >
                          <option value="">Select Column...</option>
                          {getColumnsForTable(relationData.targetTableId).map((col: any) => (
                            <option key={col.id} value={col.id.toString()}>{col.columnName}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center py-2">
                      <div className="p-2 bg-[#222] rounded-full text-[#555]">
                          <Link2 size={20} />
                      </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-[#222]">
                <button type="button" onClick={closeModals} className="flex-1 py-4 text-sm font-bold text-[#555] hover:text-white transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-white text-black font-bold rounded-2xl hover:bg-[#e5e5e5] active:scale-95 transition-all">
                    {editingColumnId ? 'Update' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}