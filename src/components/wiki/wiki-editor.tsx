"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { createArticle, updateArticle } from "@/app/actions/articles";
import { uploadFile } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type ArticleFormData,
  articleSchema,
} from "@/schemas/article-form.schema";

import { SortableImage } from "./wiki-editor-sortable-image";

export type ImageItem = {
  id: string;
  url: string;
  file?: File;
};

interface Props {
  initialTitle?: string;
  initialContent?: string;
  initialImageUrls?: string[];
  articleId?: string;
  userId?: string;
  isEditing?: boolean;
}

export default function WikiEditor({
  initialTitle = "",
  initialContent = "",
  initialImageUrls = [],
  articleId,
  userId = "user-1",
  isEditing = false,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialTitle,
      content: initialContent,
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  useEffect(() => {
    if (initialImageUrls.length) {
      setImages(
        initialImageUrls.map((url) => ({
          id: uuid(),
          url,
        })),
      );
    }
  }, [initialImageUrls]);

  function addFiles(files: FileList | File[]) {
    const newImages = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: uuid(),
        url: URL.createObjectURL(file),
        file,
      }));

    setImages((prev) => [...prev, ...newImages]);
  }

  function removeFile(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setImages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    addFiles(e.target.files);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: ArticleFormData) {
    setIsSubmitting(true);

    try {
      const urls = (
        await Promise.all(
          images.map(async (img): Promise<string> => {
            if (!img.file) return img.url;

            const fd = new FormData();
            fd.append("files", img.file);

            const uploaded = await uploadFile(fd);

            return uploaded?.url ?? "";
          }),
        )
      ).filter(Boolean);

      const payload = {
        ...data,
        imageUrls: urls,
        authorId: userId,
      };

      if (isEditing && articleId) {
        await updateArticle(articleId, payload);
        router.push(`/wiki/${articleId}`);
      } else {
        const result = await createArticle(payload);
        router.push(result.id ? `/wiki/${result.id}` : "/");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (isEditing) router.back();
    else router.push("/");
  }

  const pageTitle = isEditing ? "Edit Article" : "Create New Article";

  return (
    <Card className="container mx-auto px-4 max-w-4xl">
      <CardHeader>
        <CardTitle>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
        </CardTitle>
        {isEditing && articleId && (
          <CardDescription>Editing article ID: {articleId}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet>
            <FieldGroup>
              {/* TITLE */}

              <Field>
                <FieldLabel htmlFor="title">Article Title *</FieldLabel>

                <Input
                  id="title"
                  {...form.register("title")}
                  name="title"
                  type="text"
                  placeholder="Enter a title for your article..."
                />

                <FieldDescription>
                  A clear title helps others find your article.
                </FieldDescription>

                {form.formState.errors.title && (
                  <FieldError>{form.formState.errors.title.message}</FieldError>
                )}
              </Field>

              <FieldSeparator></FieldSeparator>

              {/* IMAGE UPLOAD */}
              <Field>
                <FieldTitle>Article Images</FieldTitle>

                <div
                  className={
                    "flex justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer " +
                    (dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-muted-foreground/25")
                  }
                >
                  <FieldLabel
                    htmlFor="file-upload"
                    className="flex flex-col justify-center cursor-pointer"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                    }}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-10 w-10 mb-3 text-muted-foreground" />
                    Drag & Drop Images or Click to Upload
                    <p className="text-sm text-muted-foreground">
                      You can attach multiple images
                    </p>
                    <Input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </FieldLabel>
                </div>

                {/* IMAGE GRID */}

                {images.length > 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FieldTitle>Attached Images:</FieldTitle>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={images.map((img) => img.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="flex flex-wrap gap-4">
                          {images.map((img) => (
                            <SortableImage
                              key={img.id}
                              img={img}
                              removeFile={removeFile}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </Field>

              <FieldSeparator></FieldSeparator>

              {/* CONTENT */}

              <Field>
                <FieldLabel htmlFor="content">Article Content *</FieldLabel>

                <MDEditor
                  value={form.watch("content")}
                  onChange={(v) => form.setValue("content", v || "")}
                  preview="edit"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    name: "content",
                    placeholder: "Write your article content in Markdown...",
                    style: { fontSize: 14, lineHeight: 1.5 },
                    // make these explicit so SSR and client output match exactly
                    // server-rendered HTML used autoCapitalize="none" — keep that value
                    autoCapitalize: "none",
                    autoComplete: "off",
                    autoCorrect: "off",
                    spellCheck: false,
                  }}
                />

                {form.formState.errors.content && (
                  <FieldError>
                    {form.formState.errors.content.message}
                  </FieldError>
                )}
              </Field>

              {/* ACTIONS */}

              <Field orientation="responsive" className="justify-end pt-4">
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>

                <Button
                  className="cursor-pointer"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  );
}
