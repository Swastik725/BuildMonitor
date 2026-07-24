import { useMemo } from "react";
import { Bell, CheckCheck, CircleAlert, Clock3, MailOpen } from "lucide-react";
import type { NavState } from "../lib/types";
import { notificationsApi, type Notification } from "../lib/api";
import { useResource } from "../lib/use-resource";
import { Btn, PageFade } from "../components/primitives";
import { TopBar } from "../components/TopBar";

const typeIcon: Record<string, typeof Bell> = {
  DEPLOYMENT: MailOpen,
  INCIDENT: CircleAlert,
  SYSTEM: Clock3,
};

function relative(date: string) {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((new Date(date).getTime() - Date.now()) / 60000),
    "minute",
  );
}

export function NotificationsPage({ onNav }: { onNav: (nav: NavState) => void }) {
  const notifications = useResource(() => notificationsApi.list(), [], 10000);

  const unread = useMemo(
    () => (notifications.data ?? []).filter(notification => !notification.read),
    [notifications.data],
  );

  const readAll = async () => {
    const unreadItems = unread;
    if (!unreadItems.length) {
      return;
    }

    await Promise.all(
      unreadItems.map(notification => notificationsApi.markRead(notification.id)),
    );
    await notifications.refresh();
  };

  return (
    <PageFade>
      <TopBar
        title="Notifications"
        crumbs={[{ label: "Command center", nav: { page: "dashboard" } }]}
        onCrumb={onNav}
      />
      <div className="saas-page space-y-5">
        <section className="glass-panel">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.06]">
            <div>
              <h2 className="text-sm font-semibold">Inbox</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                In-app updates from deployments and incidents
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {unread.length} unread
              </span>
              <Btn variant="secondary" onClick={() => void readAll()} disabled={!unread.length}>
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Btn>
            </div>
          </div>

          {notifications.error ? (
            <div className="p-6 text-sm text-destructive">{notifications.error}</div>
          ) : !notifications.loading && !notifications.data?.length ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              You do not have any notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-white/[.06]">
              {notifications.data?.map(notification => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkRead={async () => {
                    if (notification.read) {
                      return;
                    }
                    await notificationsApi.markRead(notification.id);
                    await notifications.refresh();
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageFade>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => Promise<void>;
}) {
  const Icon = typeIcon[notification.type] ?? Bell;

  return (
    <div
      className={[
        "flex items-start gap-4 p-5",
        notification.read ? "opacity-75" : "bg-primary/5",
      ].join(" ")}
    >
      <div className="mt-0.5 rounded-full bg-white/5 p-2 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{notification.title}</p>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {notification.type.toLowerCase()}
            </span>
            <span className="text-xs text-muted-foreground">
              {relative(notification.createdAt)}
            </span>
          </div>
        </div>
        {!notification.read && (
          <div className="mt-4">
            <Btn variant="secondary" size="sm" onClick={() => void onMarkRead()}>
              Mark read
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
