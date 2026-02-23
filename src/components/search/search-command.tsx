"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

type SearchRow = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  rank: number;
};

export function SearchCommand() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch search results whenever the query changes
  useEffect(() => {
    const controller = new AbortController();

    const runSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search failed:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce search by 250ms
    const id = setTimeout(runSearch, 250);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (id: number) => {
    setOpen(false);
    setQuery("");
    router.push(`/wiki/${id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* TRIGGER */}
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label="Search Articles">
          {/* Display "Icon" on small screens and "Icon + Title" on larger screens */}
          <span className="inline sm:hidden pb-0.5">
            <Search className="inline h-4 w-4" />
          </span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <Search className="inline h-4 w-4" /> Search Articles
          </span>
        </Button>
      </PopoverTrigger>

      {/* DROPDOWN */}
      <PopoverContent
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[320px] p-0 mt-1.5"
      >
        <Command shouldFilter={false} loop>
          {/* INPUT */}
          <CommandInput
            placeholder="Type to search Articles..."
            value={query}
            onValueChange={setQuery}
            autoFocus
          />

          <CommandList className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 text-sm text-muted-foreground">
                Searching…
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <CommandEmpty>No Articles found.</CommandEmpty>
            )}

            {results.length > 0 && (
              <CommandGroup heading="Articles">
                {results.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    onSelect={() => handleSelect(item.id)}
                    className="cursor-pointer items-start py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium leading-none">
                        {item.title}
                      </span>

                      {item.summary ? (
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {item.summary}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {item.content.substring(0, 194)}...
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
