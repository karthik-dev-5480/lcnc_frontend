"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Sidebar } from "../components/sidebar/page";
import { Canvas } from "../components/canvas/page";
import { PropertiesPanel } from "../components/propertiespanel/page";
import { WIDGET_PROPERTY_CONFIG } from "../components/propertiespanel/page";


export default function BuilderPage() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("id");
  const mode = searchParams.get("mode");

  const [hasMounted, setHasMounted] = useState(false);
  const [canvasItems, setCanvasItems] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageName, setPageName] = useState("");
  const [bgColor, setBgColor] = useState("#1e1e1e"); // Default dark background

  useEffect(() => {
    if (pageId) {
      // 2. Fetch page details including background color
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No session found. Please log in again.");
        return;
      }
      const numPageId = Number(pageId);
      fetch(`http://localhost:8080/api/pages/get/${numPageId}`, {
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
         },
      })
        .then((res) => res.json())
        .then((data) => {
          setPageName(data.name);
          // Check if DB has a color, otherwise keep default
          if (data.backgroundColor) {
            setBgColor(data.backgroundColor);
          }
        })
        .catch((err) => console.error("Failed to fetch page details", err));
        
      // ... existing widget fetch logic
    }
  }, [pageId]);
  // Default to preview/run mode. Only show design mode if mode=design is explicitly passed
  const isPreview = mode !== "design";

  const sensors = useSensors(useSensor(PointerSensor, { 
    activationConstraint: { distance: 8 } 
  }));

  // 1. Fetch initial data from DB based on pageId
  useEffect(() => {
    setHasMounted(true);
    if (pageId) {
      const numPageId = Number(pageId);
      fetch(`http://localhost:8080/api/widgets?pageId=${numPageId}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log("Fetched widgets:", data);
          setCanvasItems(Array.isArray(data) ? data : []);
        })
        .catch(error => console.error("Failed to fetch widgets:", error));
    }
  }, [pageId]);

  // 2. Sync updates to DB (debounced in production)
 // Inside BuilderPage.tsx

// ... existing imports

const syncToDb = async (widget: any) => {
  if (isPreview || !widget) return;
  try {
    // FIX: Ensure properties is never an empty or invalid array that crashes the DB
    const cleanProperties = (widget.properties || []).map((prop: any) => ({
      propertyName: prop.propertyName,
      propertyValue: String(prop.propertyValue) // Ensure value is a string
    }));

    const payload = {
      id: widget.id,
      pageId: Number(pageId),
      type: widget.type,
      label: widget.label,
      x: widget.x || 0,
      y: widget.y || 0,
      parentId: widget.parentId,
      widgetOrder: widget.widgetOrder || 0,
      properties: cleanProperties
    };

    const response = await fetch(`http://localhost:8080/api/widgets/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error: ${errorText}`);
    }
  } catch (error) {
    console.error("Failed to sync widget:", error);
  }
};
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || isPreview) return;

  const activeId = String(active.id);
  const overId = String(over.id);
  
  // Determine parentId: null if canvas, otherwise the ID of the widget dropped into
  const parentId = overId === "canvas" ? null : Number(overId);

  // Validation: Check if the 'over' widget is actually a container
  if (parentId !== null) {
    const parentWidget = canvasItems.find(w => Number(w.id) === parentId);
    const containerTypes = ['w-section', 'w-responsivelayout', 'w-column', 'w-grid'];
    
    if (parentWidget && !containerTypes.includes(parentWidget.type)) {
      console.warn("Cannot drop inside a non-container widget.");
      return;
    }
  }

  // Determine if it's a new widget from sidebar or moving an existing one
  const isNewWidget = activeId.startsWith("w-");

  if (isNewWidget) {
    const configForType = WIDGET_PROPERTY_CONFIG[activeId] || [];
    const defaultProps = configForType.map((p: any) => ({
      propertyName: p.name,
      propertyValue: String(p.default)
    }));

    const newWidget = {
      pageId: Number(pageId),
      type: activeId,
      label: activeId.replace('w-', '').toUpperCase(),
      parentId: parentId,
      widgetOrder: canvasItems.filter(w => w.parentId === parentId).length,
      properties: defaultProps
    };

    try {
      const res = await fetch(`http://localhost:8080/api/widgets/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWidget),
      });

      if (res.ok) {
        const saved = await res.json();
        setCanvasItems((prev) => [...prev, saved]);
        setSelectedId(String(saved.id));
      }
    } catch (error) {
      console.error("Creation failed", error);
    }
  } else {
    // Moving an existing widget
    const movedWidget = canvasItems.find(w => String(w.id) === activeId);
    if (movedWidget) {
      const updatedWidget = { 
        ...movedWidget, 
        parentId: parentId,
        widgetOrder: canvasItems.filter(w => w.parentId === parentId).length
      };
      
      // Update locally
      setCanvasItems(prev => prev.map(w => String(w.id) === activeId ? updatedWidget : w));
      // Sync to DB
      syncToDb(updatedWidget);
    }
  }
};
  const handleUpdateItem = (id: string, updates: any) => {
    setCanvasItems((prev) => {
      const newState = prev.map((item) => 
        String(item.id) === String(id) ? { ...item, ...updates } : item
      );
      const updatedItem = newState.find(i => String(i.id) === String(id));
      if (updatedItem) {
        syncToDb(updatedItem); // Push property change to DB
      }
      return newState;
    });
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/widgets/${id}`, { 
        method: "DELETE" 
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // Refetch all widgets to update parent and handle orphaned children
      const fetchResponse = await fetch(`http://localhost:8080/api/widgets?pageId=${pageId}`);
      if (fetchResponse.ok) {
        const updatedData = await fetchResponse.json();
        setCanvasItems(Array.isArray(updatedData) ? updatedData : []);
      }
      
      setSelectedId(null);
    } catch (error) {
      console.error("Failed to delete widget:", error);
    }
  };

  

  if (!hasMounted) return <div className="flex h-screen bg-black w-full" />;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="flex h-screen w-screen text-white overflow-hidden"
      style={{ backgroundColor: bgColor }} 
      >
        {!isPreview && <Sidebar />}
        <section className="flex-1 flex flex-col min-w-0 h-full" onClick={() => setSelectedId(null)}>
          <Canvas 
            items={canvasItems} 
            selectedId={selectedId} 
            onSelectItem={(item: any) => !isPreview && setSelectedId(String(item.id))} 
            isPreview={isPreview}
            bgColor={bgColor}
          />
        </section>
        {!isPreview && (
          <PropertiesPanel 
            selectedItem={canvasItems.find(i => String(i.id) === selectedId)} 
            onUpdate={handleUpdateItem} 
            onDelete={handleDeleteItem} 
            onClose={() => setSelectedId(null)} 
          />
        )}
      </main>
    </DndContext>
  );
}