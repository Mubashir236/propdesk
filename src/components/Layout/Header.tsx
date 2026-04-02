import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Bell, Search, Menu, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, timeAgo } from "@/lib/utils";

interface HeaderProps {
  onMobileMenuToggle: () => void;
  role?: "ceo" | "agent";
}

export default function Header({ onMobileMenuToggle, role }: HeaderProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const notifications = useQuery(api.notifications.listNotifications, {
    unread_only: false,
  });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllRead = useMutation(api.notifications.markAllAsRead);

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <header className="h-16 border-b bg-white flex items-center px-4 gap-3 shrink-0 z-20">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden text-muted-foreground hover:text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="Search properties, leads…"
              className="h-8 text-sm"
              onBlur={() => setSearchOpen(false)}
            />
            <button onClick={() => setSearchOpen(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Search className="w-4 h-4" />
            <span>Search…</span>
          </button>
        )}
      </div>

      <div className="flex-1 sm:flex-none" />

      {/* Role badge */}
      {role && (
        <span
          className={cn(
            "hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
            role === "ceo"
              ? "bg-[#C9A84C]/20 text-[#A8893A]"
              : "bg-navy-50 text-navy-600"
          )}
        >
          {role.toUpperCase()}
        </span>
      )}

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead({})}
                className="text-xs text-[#C9A84C] hover:text-[#A8893A] flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>
          <DropdownMenuSeparator />
          {!notifications || notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 15).map((n) => (
                <DropdownMenuItem
                  key={n._id}
                  className={cn(
                    "flex flex-col items-start gap-0.5 cursor-pointer py-2.5",
                    !n.is_read && "bg-blue-50/50"
                  )}
                  onClick={() => {
                    if (!n.is_read) markAsRead({ notification_id: n._id });
                    if (n.related_id) navigate(`/leads/${n.related_id}`);
                  }}
                >
                  <span className="text-sm font-medium leading-tight">{n.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(n.created_at)}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }}
      />
    </header>
  );
}
