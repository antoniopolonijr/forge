import { UserButton } from "@stackframe/stack";
import { Plus } from "lucide-react";
import Link from "next/link";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { stackServerApp } from "@/stack/server";

export default async function NavBar() {
  const user = await stackServerApp.getUser();

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 mb-8">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* LEFT — Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-bold text-3xl tracking-tight text-gray-900"
          >
            Forge
          </Link>
        </div>

        {/* RIGHT — Actions */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            <NavigationMenuItem>
              <SearchCommand />
            </NavigationMenuItem>
            {user ? (
              <>
                <NavigationMenuItem>
                  <Button asChild variant="outline" aria-label="New Article">
                    <Link href="/wiki/edit/new">
                      {/* Display "Icon" on small screens and "Icon + Title" on larger screens */}
                      <span className="inline sm:hidden pb-0.5">
                        <Plus className="inline h-4 w-4" />
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-2">
                        <Plus className="inline h-4 w-4" /> New Article
                      </span>
                    </Link>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <UserButton />
                </NavigationMenuItem>
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <Button asChild variant="outline">
                    <Link href="/handler/sign-in">Sign In</Link>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button asChild>
                    <Link href="/handler/sign-up">Sign Up</Link>
                  </Button>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
