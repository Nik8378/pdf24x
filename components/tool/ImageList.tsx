"use client";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Eye, RotateCcw, RotateCw, Trash2, X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatBytes } from "@/lib/pdfEngine";
import type { ImageFile } from "@/types";

// ─── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ img, onClose }: { img: ImageFile; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--line)] max-w-2xl w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
          <p className="text-[13.5px] font-medium text-[var(--txt)] truncate pr-4">{img.name}</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center bg-[var(--hover-soft)] min-h-[300px]">
          <img
            src={img.dataUrl}
            alt={img.name}
            className="max-w-full max-h-[65vh] object-contain rounded-lg border border-[var(--line)] shadow-card"
            style={{ transform: `rotate(${img.rotation}deg)` }}
          />
        </div>
        <div className="px-4 py-3 border-t border-[var(--line)] flex gap-4 text-[12px] text-[var(--txt-2)]">
          <span>{formatBytes(img.size)}</span>
          {img.width && img.height && (
            <span>{img.width} × {img.height}px</span>
          )}
          {img.rotation > 0 && <span>Rotated {img.rotation}°</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Item ─────────────────────────────────────────────────────────────
function SortableItem({ img, index }: { img: ImageFile; index: number }) {
  const [preview, setPreview] = useState(false);
  const { removeImage, rotateImage } = useAppStore();

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2.5 sm:gap-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2.5 hover:border-[var(--line-mid)] hover:shadow-md transition-all group"
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="text-[var(--txt-2)] hover:text-[var(--txt-2)] cursor-grab active:cursor-grabbing touch-none shrink-0 p-0.5"
        >
          <GripVertical size={15} strokeWidth={1.8} />
        </div>

        {/* Page number */}
        <span className="text-[11.5px] font-medium text-[var(--txt-2)] w-5 text-center shrink-0 select-none">
          {index + 1}
        </span>

        {/* Thumbnail */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-[var(--line)] bg-[var(--hover-soft)] shrink-0">
          <img
            src={img.dataUrl}
            alt={img.name}
            className="w-full h-full object-cover transition-all"
            style={{ transform: `rotate(${img.rotation}deg)` }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--txt)] truncate">{img.name}</p>
          <p className="text-[11.5px] text-[var(--txt-2)] flex items-center gap-2 flex-wrap">
            <span>{formatBytes(img.size)}</span>
            {img.width && img.height && (
              <span className="hidden sm:inline">{img.width}×{img.height}px</span>
            )}
            {img.rotation > 0 && (
              <span className="text-accent">{img.rotation}°</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => setPreview(true)}
            className="p-2 rounded-lg text-[var(--txt-2)] hover:text-[var(--txt-2)] hover:bg-[var(--hover-soft)] transition-colors"
            title="Preview"
          >
            <Eye size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => rotateImage(img.id, "ccw")}
            className="p-2 rounded-lg text-[var(--txt-2)] hover:text-[var(--txt-2)] hover:bg-[var(--hover-soft)] transition-colors"
            title="Rotate left"
          >
            <RotateCcw size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => rotateImage(img.id, "cw")}
            className="p-2 rounded-lg text-[var(--txt-2)] hover:text-[var(--txt-2)] hover:bg-[var(--hover-soft)] transition-colors"
            title="Rotate right"
          >
            <RotateCw size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => removeImage(img.id)}
            className="p-2 rounded-lg text-[var(--txt-2)] hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {preview && <PreviewModal img={img} onClose={() => setPreview(false)} />}
    </>
  );
}

// ─── Image List ────────────────────────────────────────────────────────────────
export function ImageList() {
  const { images, reorderImages, clearImages } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = images.findIndex((i) => i.id === active.id);
    const to = images.findIndex((i) => i.id === over.id);
    if (from !== -1 && to !== -1) reorderImages(from, to);
  };

  if (!images.length) return null;

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h3 className="text-[13.5px] font-semibold text-[var(--txt)]">
          {images.length} Image{images.length !== 1 ? "s" : ""}
          <span className="ml-1 text-[var(--txt-2)] font-normal">
            · drag to reorder
          </span>
        </h3>
        <div className="flex-1" />
        <button
          onClick={clearImages}
          className="flex items-center gap-1.5 text-[12.5px] text-[var(--txt-2)] hover:text-red-500 bg-[var(--surface)] border border-[var(--line)] hover:border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-all"
        >
          <Trash2 size={12} strokeWidth={2} />
          Clear All
        </button>
      </div>

      {/* Sortable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {images.map((img, idx) => (
              <SortableItem key={img.id} img={img} index={idx} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
