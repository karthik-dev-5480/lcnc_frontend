"use client";
import { X, Settings2, Trash2 } from "lucide-react";

export const WIDGET_PROPERTY_CONFIG: any = {
  "w-section": [
    { name: "backgroundColor", label: "Background Color", type: "color", default: "#ffffff" },
    { name: "padding", label: "Padding", type: "text", default: "16" },
    { name: "borderRadius", label: "Border Radius", type: "text", default: "8" },
  ],
  "w-button": [
    { name: "backgroundColor", label: "Background Color", type: "color", default: "#000000" },
    { name: "textColor", label: "Text Color", type: "color", default: "#ffffff" },
    { name: "fontSize", label: "Font Size", type: "text", default: "14" },
    { name: "padding", label: "Padding", type: "text", default: "8" },
    { name: "borderRadius", label: "Border Radius", type: "text", default: "4" },
  ],
  "w-input": [
    { name: "placeholder", label: "Placeholder", type: "text", default: "Enter text..." },
    { name: "backgroundColor", label: "Background Color", type: "color", default: "#ffffff" },
    { name: "textColor", label: "Text Color", type: "color", default: "#000000" },
    { name: "fontSize", label: "Font Size", type: "text", default: "14" },
    { name: "padding", label: "Padding", type: "text", default: "8" },
    { name: "borderColor", label: "Border Color", type: "color", default: "#cccccc" },
  ],
  "w-label": [
    { name: "label", label: "Text Content", type: "text", default: "Label" },
    { name: "fontSize", label: "Font Size", type: "text", default: "14" },
    { name: "textColor", label: "Text Color", type: "color", default: "#000000" },
    { name: "fontWeight", label: "Font Weight", type: "select", options: ["normal", "bold", "lighter"], default: "normal" },
  ],
  "w-table": [
    { name: "headerBackgroundColor", label: "Header Background", type: "color", default: "#f0f0f0" },
    { name: "rowHeight", label: "Row Height", type: "text", default: "32" },
    { name: "borderColor", label: "Border Color", type: "color", default: "#cccccc" },
  ],
  "w-responsivelayout": [
  { name: "layoutType", label: "Layout Type", type: "select", options: ["grid", "fluid"], default: "grid" },
  { name: "columns", label: "Grid Columns (1-12)", type: "text", default: "3" },
  { name: "gap", label: "Gap (px)", type: "text", default: "16" },
  { name: "backgroundColor", label: "Background Color", type: "color", default: "transparent" },
],
  "w-column": [
    { name: "width", label: "Width", type: "text", default: "100" },
    { name: "backgroundColor", label: "Background Color", type: "color", default: "#ffffff" },
    { name: "padding", label: "Padding", type: "text", default: "8" },
  ],
};

function PropertyInput({ property, value, onUpdate }: any) {
  const commonClasses = "w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white transition-all";
  
  if (property.type === "color") {
    return (
      <div className="flex gap-2">
        <input
          type="color"
          value={value || property.default}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-10 h-8 rounded cursor-pointer border border-[#333] bg-transparent"
        />
        <input 
          type="text" 
          value={value || property.default} 
          onChange={(e) => onUpdate(e.target.value)}
          className={commonClasses}
        />
      </div>
    );
  }

  if (property.type === "select") {
    return (
      <select value={value || property.default} onChange={(e) => onUpdate(e.target.value)} className={commonClasses}>
        {property.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={value || property.default}
      onChange={(e) => onUpdate(e.target.value)}
      className={commonClasses}
    />
  );
}

export function PropertiesPanel({ selectedItem, onUpdate, onDelete, onClose }: any) {
  if (!selectedItem) return null;

  const widgetConfig = WIDGET_PROPERTY_CONFIG[selectedItem.type] || [];
  const existingProps = selectedItem.properties || [];

  const updateProperty = (propertyName: string, propertyValue: string) => {
    // 1. Create a map of existing properties
    const propMap = new Map(existingProps.map((p: any) => [p.propertyName, p.propertyValue]));
    
    // 2. Update or Add the new value
    propMap.set(propertyName, propertyValue);
    
    // 3. Convert back to array for the backend
    const updatedProps = Array.from(propMap.entries()).map(([name, value]) => ({
      propertyName: name,
      propertyValue: value
    }));

    onUpdate(String(selectedItem.id), { properties: updatedProps });
  };

  return (
    <aside className="w-80 bg-[#0d0d0d] border-l border-[#222] flex flex-col h-full">
      <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-gray-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Design</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Info */}
        <section className="space-y-4 border-b border-[#222] pb-6">
           <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Label</label>
            <input
              type="text"
              value={selectedItem.label || ""}
              onChange={(e) => onUpdate(String(selectedItem.id), { label: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-xs text-white"
            />
          </div>
        </section>

        {/* Dynamic Properties */}
        <section className="space-y-6">
          <h3 className="text-[9px] uppercase font-bold text-blue-500 tracking-widest">Styles & Config</h3>
          {widgetConfig.map((prop: any) => {
            const currentVal = existingProps.find((p: any) => p.propertyName === prop.name)?.propertyValue;
            return (
              <div key={prop.name} className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">{prop.label}</label>
                <PropertyInput
                  property={prop}
                  value={currentVal}
                  onUpdate={(val: string) => updateProperty(prop.name, val)}
                />
              </div>
            );
          })}
        </section>
      </div>

      <div className="p-6 border-t border-[#222]">
        <button 
          onClick={() => onDelete(String(selectedItem.id))}
          className="w-full py-3 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={14} /> Delete Widget
        </button>
      </div>
    </aside>
  );
}