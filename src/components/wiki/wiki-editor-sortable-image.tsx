"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { ImageItem } from "./wiki-editor";

interface SortableImageProps {
  img: ImageItem;
  removeFile: (id: string) => void;
}

export function SortableImage({ img, removeFile }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative cursor-grab"
    >
      <Image
        src={img.url}
        alt="preview"
        width={96}
        height={96}
        className="object-cover rounded-md border"
        unoptimized
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => removeFile(img.id)}
        className="absolute -top-2 -right-2 h-6 w-6 p-0 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
