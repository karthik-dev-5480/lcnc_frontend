"use client";
import { Database, Type, MousePointer2, LayoutGrid, LayoutTemplate, Tag, Layers } from "lucide-react";
import { DraggableWidget } from "../widget/page";

const WIDGET_TYPES = [
  { id: "w-section", label: "Section", icon: <Layers size={18} /> },
  { id: "w-table", label: "Table", icon: <Database size={18} /> },
  { id: "w-input", label: "Input", icon: <Type size={18} /> },
  { id: "w-button", label: "Button", icon: <MousePointer2 size={18} /> },
  { id: "w-label", label: "Label", icon: <Tag size={18} /> },
  { id: "w-responsivelayout", label: "Responsive Layout", icon: <LayoutGrid size={18} /> },
  { id: "w-column", label: "Column", icon: <LayoutTemplate size={18} /> },
];

export function Sidebar() {
  return (
    <aside className="w-72 bg-[#0d0d0d] border-r border-[#222] p-6 flex flex-col gap-8 h-full">
      <div>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6">UI Elements</h2>
        <div className="grid grid-cols-2 gap-3">
          {WIDGET_TYPES.map((w) => (
            <DraggableWidget key={w.id} id={w.id} label={w.label} icon={w.icon} />
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-6 border-t border-[#222]">
        <p className="text-[9px] text-gray-600 leading-relaxed uppercase tracking-widest">
          Enterprise Builder v1.0
        </p>
      </div>
    </aside>
  );
}