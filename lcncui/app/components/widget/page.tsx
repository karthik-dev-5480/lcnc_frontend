"use client";
import { useDraggable } from "@dnd-kit/core";

export function DraggableWidget({ id, label, icon }: { id: string; label: string; icon: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center gap-2 p-4 bg-[#1a1a1a] border border-[#333] rounded-xl hover:border-white transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-30 scale-95" : "opacity-100"
      }`}
    >
      <div className="text-gray-400">{icon}</div>
      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{label}</span>
    </div>
  );
}