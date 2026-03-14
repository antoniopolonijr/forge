import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WikiCardProps {
  title: string;
  author: string;
  date: string;
  summary: string;
  href: string;
  imageUrl?: string | null;
}

export function WikiCard({
  title,
  author,
  date,
  summary,
  href,
  imageUrl,
}: WikiCardProps) {
  return (
    <Link
      href={href}
      className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{author}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          {/* Article Image - Display if exists */}
          {imageUrl && (
            <div className="relative h-64 rounded-lg mb-4">
              <Image
                src={imageUrl}
                alt={`Image for ${title}`}
                fill
                className="h-full max-h-\[100vw\] max-w-full object-contain object-center rounded-lg"
                priority
              />
            </div>
          )}
          <CardDescription>{summary}</CardDescription>
        </CardContent>
        <CardFooter className="pt-2">
          <span className="text-blue-600 text-sm font-medium w-fit">
            Read article &rarr;
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
