"use client";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

// Helper function to get property value from widget
function getProperty(item: any, propertyName: string): string | undefined {
  return item.properties?.find((p: any) => p.propertyName === propertyName)?.propertyValue;
}

// Helper function to build style object from properties
function getWidgetStyles(item: any): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  if (!item.properties) return styles;
  
  // Generic properties
  const backgroundColor = getProperty(item, 'backgroundColor');
  if (backgroundColor) {
    styles.backgroundColor = backgroundColor;
  }
  
  const textColor = getProperty(item, 'textColor');
  if (textColor) {
    styles.color = textColor;
  }
  
  const fontSize = getProperty(item, 'fontSize');
  if (fontSize) {
    styles.fontSize = `${fontSize}px`;
  }
  
  const padding = getProperty(item, 'padding');
  if (padding) {
    styles.padding = `${padding}px`;
  }
  
  const borderRadius = getProperty(item, 'borderRadius');
  if (borderRadius) {
    styles.borderRadius = `${borderRadius}px`;
  }
  
  const borderColor = getProperty(item, 'borderColor');
  if (borderColor) {
    styles.borderColor = borderColor;
  }
  
  return styles;
}

export function Canvas({ items, selectedId, onSelectItem, isPreview,bgColor }: any) {
  const { setNodeRef } = useDroppable({ id: "canvas" });

  // Only render top-level widgets (parentId is null); children are handled recursively
  const rootItems = items.filter((item: any) => item.parentId === null || item.parentId === undefined).sort((a: any, b: any) => (a.widgetOrder || 0) - (b.widgetOrder || 0));

  console.log("Canvas - Total items:", items.length, "Root items:", rootItems.length, "Root items data:", rootItems);

  return (
    <div
      ref={setNodeRef}
      style={{ backgroundColor: bgColor }}
      className={`flex-1 overflow-auto transition-all ${
        isPreview ? " w-full h-full" : "rounded-tl-[40px] border-t border-l border-[#222] p-8"
      }`}
    >
      {rootItems.length === 0 && !isPreview && (
        <div className="flex flex-col items-center justify-center h-full text-[#444]"><Plus size={40} className="mb-4 opacity-20" /><p className="uppercase text-xs font-bold">Drag Section or Widgets</p></div>
      )}
      <div className={`flex flex-col gap-4 ${
        isPreview ? "w-full h-full" : "max-w-4xl mx-auto"
      }`}>
        {rootItems.map((item: any) => {
          const uniqueKey = item.id ? `widget-${item.id}` : `temp-${Math.random()}`;
          return (
            <RecursiveWidget 
              key={uniqueKey} 
              item={item} 
              allItems={items} 
              selectedId={selectedId} 
              onSelectItem={onSelectItem} 
              isPreview={isPreview} 
            />
          );
        })}
      </div>
    </div>
  );
}

function RecursiveWidget({ item, allItems, selectedId, onSelectItem, isPreview }: any) {
  // Container widgets that can hold children
  const containerTypes = ['w-section', 'w-grid', 'w-responsivelayout', 'w-column'];
  const isContainer = containerTypes.includes(item.type);
  
  const { setNodeRef, isOver } = useDroppable({ 
    id: String(item.id), 
    disabled: !isContainer 
  });
  
  const children = allItems
    .filter((child: any) => String(child.parentId) === String(item.id))
    .sort((a: any, b: any) => (a.widgetOrder || 0) - (b.widgetOrder || 0));

  const isSelected = String(selectedId) === String(item.id);
  const widgetStyles = getWidgetStyles(item);
  

  // Render Section widget
  if (item.type === "w-section") {
    return (
      <div
        ref={setNodeRef}
        onClick={(e) => { e.stopPropagation(); onSelectItem(item); }}
        style={widgetStyles}
        className={`${
          isPreview
            ? "rounded p-6"
            : `border-2 rounded cursor-pointer transition-all p-6 ${isSelected ? "border-white ring-2 ring-white/20" : "border-gray-700"}`
        }`}
      >
        {!isPreview && <div className="text-[10px] text-gray-500 uppercase mb-4 font-bold">{item.label || 'Section'}</div>}
        <div className="space-y-3">
          {children.length === 0 && !isPreview && (
            <div className="text-[10px] text-gray-600 italic">Drop widgets here</div>
          )}
          {children.map((child: any) => (
            <RecursiveWidget key={child.id} item={child} allItems={allItems} selectedId={selectedId} onSelectItem={onSelectItem} isPreview={isPreview} />
          ))}
        </div>
      </div>
    );
  }

  // Render other widget types
  return (
    <div 
      ref={setNodeRef}
      onClick={(e) => { e.stopPropagation(); onSelectItem(item); }}
      style={widgetStyles}
      className={`transition-all ${
        isPreview 
          ? "p-3 rounded border" 
          : `p-3 rounded border cursor-pointer ${isSelected ? "border-white ring-2 ring-white/20" : "border-gray-600"}`
      }`}
    >
      {!isPreview && <div className="text-[7px] text-gray-500 uppercase mb-2">{item.type}</div>}
      
      {item.type === "w-button" && (
        <button 
          style={{ backgroundColor: getProperty(item, 'backgroundColor') || '#000000', color: getProperty(item, 'textColor') || '#ffffff' }}
          className="px-4 py-2 font-bold text-xs uppercase rounded"
        >
          {item.label}
        </button>
      )}
      
      {item.type === "w-input" && (
        <input 
          placeholder={item.label}
          style={{ 
            backgroundColor: getProperty(item, 'backgroundColor') || '#1a1a1a',
            color: getProperty(item, 'textColor') || '#ffffff',
            borderColor: getProperty(item, 'borderColor') || '#333333'
          }}
          className="w-full border p-2 text-xs" 
          disabled={!isPreview}
        />
      )}

      {item.type === "w-table" && (
        <div 
          style={{ backgroundColor: getProperty(item, 'backgroundColor') }}
          className="min-w-full border rounded p-3"
        >
          <div className="text-xs font-bold mb-2">{item.label}</div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ backgroundColor: getProperty(item, 'headerBackgroundColor') }}>
                <th className="border px-2 py-1 text-left">Column 1</th>
                <th className="border px-2 py-1 text-left">Column 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">Data</td>
                <td className="border px-2 py-1">Data</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {item.type === "w-label" && (
        <div style={{ color: getProperty(item, 'textColor'), fontSize: (getProperty(item, 'fontSize') || '14') + 'px' }} className="font-medium">
          {item.label || 'Label'}
        </div>
      )}

      {item.type === "w-responsivelayout" && (
  <div 
    style={{ backgroundColor: getProperty(item, 'backgroundColor') }}
    className="min-w-full border rounded p-4 flex flex-col gap-4"
  >
    {/* Label is now on its own row, not part of the grid */}
    {!isPreview && (
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2">
        {item.label || 'Responsive Layout'}
      </div>
    )}

    {/* This inner div handles the actual layout logic */}
    <div 
      style={{ 
        display: getProperty(item, 'layoutType') === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: getProperty(item, 'layoutType') === 'grid' 
          ? `repeat(${getProperty(item, 'columns') || 3}, 1fr)` 
          : undefined,
        gap: `${getProperty(item, 'gap') || 16}px`,
        flexWrap: getProperty(item, 'layoutType') === 'grid' ? undefined : 'wrap'
      }}
    >
      {children.map((child: any) => (
        <RecursiveWidget 
          key={child.id} 
          item={child} 
          allItems={allItems} 
          selectedId={selectedId} 
          onSelectItem={onSelectItem} 
          isPreview={isPreview} 
        />
      ))}
    </div>
  </div>
)}

      {item.type === "w-grid" && (
        <div className="min-w-full border border-dashed rounded p-2" style={{ borderColor: getProperty(item, 'borderColor') }}>
          {children.map((child: any) => (
            <RecursiveWidget key={child.id} item={child} allItems={allItems} selectedId={selectedId} onSelectItem={onSelectItem} isPreview={isPreview} />
          ))}
        </div>
      )}

      {item.type === "w-column" && (
    <div 
      ref={setNodeRef}
      onClick={(e) => { e.stopPropagation(); onSelectItem(item); }}
      style={{ 
        backgroundColor: getProperty(item, 'backgroundColor') || 'transparent',
        padding: `${getProperty(item, 'padding') || 8}px`,
        minHeight: isPreview ? "auto" : "80px", // Remove min-height in run mode if empty
        width: "100%"
      }}
      className={`transition-all rounded ${
        isPreview 
          ? "" // No border in Run mode
          : `border-2 border-dashed ${isOver ? "border-blue-500 bg-blue-500/10" : "border-gray-700"} ${isSelected ? "ring-2 ring-white" : ""}`
      }`}
    >
      {/* Hide the "Column" label in Run mode */}
      {!isPreview && (
        <div className="text-[9px] text-blue-400 uppercase mb-2 font-bold opacity-50">
          {item.label || 'Column'}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {/* Hide "Drop here" helper in Run mode */}
        {children.length === 0 && !isPreview && (
          <div className="text-[8px] text-gray-600 text-center py-4">Drop widgets here</div>
        )}
        
        {children.map((child: any) => (
          <RecursiveWidget 
            key={child.id} 
            item={child} 
            allItems={allItems} 
            selectedId={selectedId} 
            onSelectItem={onSelectItem} 
            isPreview={isPreview} 
          />
        ))}
      </div>
    </div>
  )}
    </div>
  );
}
