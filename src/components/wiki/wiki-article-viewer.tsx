"use client";

import { Calendar, ChevronRight, Edit, Eye, Home, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { incrementPageview } from "@/app/actions/pageviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DeleteArticleDialog } from "@/components/wiki/wiki-delete-article-dialog";

interface ViewerArticle {
  title: string;
  author: string | null;
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
}

interface WikiArticleViewerProps {
  article: ViewerArticle;
  canEdit?: boolean;
  pageviews?: number | null;
}

export default function WikiArticleViewer({
  article,
  canEdit = false,
}: WikiArticleViewerProps) {
  // PageViews state to reflect real-time updates after incrementing on mount
  const [localPageviews, setLocalPageviews] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPageview() {
      const newCount = await incrementPageview(article.id);
      setLocalPageviews(newCount ?? null);
    }
    fetchPageview();
  }, [article.id]);

  // Format Date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Carousel State and Handlers
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Guard against null or undefined imageUrls
  const urls = article.imageUrls as string[];

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/"
          className="flex items-center hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4 mr-1" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{article.title}</span>
      </nav>

      {/* Article Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex flex-col justify-end sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {article.title}
            </h1>
            {/* Edit Button and Delete Button - Only shown if user has edit permissions */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button asChild>
                  <Link href={`/wiki/edit/${article.id}`}>
                    <Edit className="h-4 w-4" />
                    Edit Article
                  </Link>
                </Button>

                <DeleteArticleDialog articleId={String(article.id)} />
              </div>
            )}
          </div>

          {/* Article Metadata */}
          <div
            className="flex flex-wrap items-center gap-4
           text-sm text-muted-foreground"
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span> {article.author ?? "Unknown"}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary">Article</Badge>
              <div className="ml-3 flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span>{localPageviews ? localPageviews : "—"}</span>
                <span className="ml-1">views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <Card>
        <CardContent>
          {/* Article Image - Display if exists */}

          {article.imageUrls && article.imageUrls.length > 0 && (
            <div className="mx-auto max-w-[10rem] sm:max-w-xs pb-4">
              <Carousel
                setApi={setApi}
                className="w-full max-w-xs"
                opts={{
                  loop: true,
                }}
              >
                <CarouselContent>
                  {urls.map((url) => (
                    <CarouselItem key={url}>
                      <div className="m-px">
                        <div className="relative aspect-square p-2">
                          <Image
                            src={url}
                            alt={`Image ${current} of ${urls.length} for article ${article.title}`}
                            fill
                            className="object-contain rounded-lg"
                            priority={current === 1}
                            loading={current === 1 ? "eager" : "lazy"}
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {urls.length > 1 && <CarouselPrevious />}
                {urls.length > 1 && <CarouselNext />}
              </Carousel>
              {urls.length > 1 && (
                <div className="flex justify-center gap-2 pt-3">
                  {urls.map((url, index) => (
                    <span
                      key={url}
                      className={`h-2 w-2 rounded-full ${
                        current === index + 1
                          ? "bg-primary"
                          : "bg-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rendered Markdown Content */}
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                // Customize heading styles
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">
                    {children}
                  </h3>
                ),
                // Customize paragraph styles
                p: ({ children }) => (
                  <p className="mb-4 text-foreground leading-7">{children}</p>
                ),
                // Customize list styles
                ul: ({ children }) => (
                  <ul className="mb-4 ml-6 list-disc text-foreground">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 ml-6 list-decimal text-foreground">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1 text-foreground">{children}</li>
                ),
                // Customize code styles
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm">
                    {children}
                  </pre>
                ),
                // Customize blockquote styles
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                // Customize link styles
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                // Customize table styles
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">{children}</td>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="mt-6 flex flex-wrap-reverse justify-between items-center gap-4">
        <Button asChild variant="outline">
          <Link href="/">← Back to Home</Link>
        </Button>

        {/* Edit Button and Delete Button - Only shown if user has edit permissions */}
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/wiki/edit/${article.id}`}>
                <Edit className="h-4 w-4" />
                Edit Article
              </Link>
            </Button>

            <DeleteArticleDialog articleId={String(article.id)} />
          </div>
        )}
      </div>
    </div>
  );
}
