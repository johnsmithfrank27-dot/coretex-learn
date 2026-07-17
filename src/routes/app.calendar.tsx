import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Plus, Trash2, Pencil, MapPin, Clock, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  listCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  type CalendarEvent,
} from "@/lib/calendar.functions";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Coretex" },
      { name: "description", content: "Plan your study schedule with sessions, exams and deadlines." },
    ],
  }),
  component: Page,
});

type FormState = {
  id?: string;
  title: string;
  description: string;
  category: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string;
};

const empty: FormState = {
  title: "",
  description: "",
  category: "study",
  starts_at: "",
  ends_at: "",
  all_day: false,
  location: "",
};

const CATEGORIES = ["study", "exam", "deadline", "class", "other"];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Page() {
  const qc = useQueryClient();
  const list = useServerFn(listCalendarEvents);
  const create = useServerFn(createCalendarEvent);
  const update = useServerFn(updateCalendarEvent);
  const remove = useServerFn(deleteCalendarEvent);

  const { data, isLoading } = useQuery({ queryKey: ["calendar_events"], queryFn: () => list() });

  const [form, setForm] = useState<FormState>(empty);
  const [open, setOpen] = useState(false);

  const saveMut = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = {
        title: f.title.trim(),
        description: f.description.trim() || null,
        category: f.category,
        starts_at: new Date(f.starts_at).toISOString(),
        ends_at: f.ends_at ? new Date(f.ends_at).toISOString() : null,
        all_day: f.all_day,
        location: f.location.trim() || null,
      };
      if (f.id) return update({ data: { id: f.id, patch: payload } });
      return create({ data: payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar_events"] });
      setForm(empty);
      setOpen(false);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_events"] }),
  });

  function edit(ev: CalendarEvent) {
    setForm({
      id: ev.id,
      title: ev.title,
      description: ev.description ?? "",
      category: ev.category,
      starts_at: toLocalInput(ev.starts_at),
      ends_at: ev.ends_at ? toLocalInput(ev.ends_at) : "",
      all_day: ev.all_day,
      location: ev.location ?? "",
    });
    setOpen(true);
  }

  function openNew() {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    setForm({ ...empty, starts_at: toLocalInput(now.toISOString()) });
    setOpen(true);
  }

  const events = data ?? [];
  const now = Date.now();
  const upcoming = events.filter(e => new Date(e.starts_at).getTime() >= now - 86_400_000);
  const past = events.filter(e => new Date(e.starts_at).getTime() < now - 86_400_000);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader title="Calendar" subtitle="Plan your study schedule." />
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-elegant transition"
        >
          <Plus className="h-4 w-4" /> New event
        </button>
      </div>

      {open && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">{form.id ? "Edit event" : "New event"}</h3>
            <button onClick={() => { setOpen(false); setForm(empty); }} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (form.title && form.starts_at) saveMut.mutate(form); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <label className="md:col-span-2 text-sm space-y-1">
              <span className="font-semibold">Title</span>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Biology midterm review" />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-semibold">Starts</span>
              <input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-semibold">Ends (optional)</span>
              <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-semibold">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm space-y-1">
              <span className="font-semibold">Location</span>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Library, Zoom, room 204…" />
            </label>
            <label className="md:col-span-2 text-sm space-y-1">
              <span className="font-semibold">Notes</span>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Topics, links, reminders…" />
            </label>
            <label className="md:col-span-2 inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.all_day} onChange={(e) => setForm({ ...form, all_day: e.target.checked })} />
              <span>All-day event</span>
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button disabled={saveMut.isPending} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">
                {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {form.id ? "Save changes" : "Create event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : events.length === 0 ? (
        <EmptyState icon={Calendar} title="No events yet" description="Add exams, deadlines, and study sessions to see them here." actionLabel="Create your first event" onAction={openNew} />
      ) : (
        <div className="space-y-8">
          <Section title="Upcoming" items={upcoming} onEdit={edit} onDelete={(id) => delMut.mutate(id)} />
          {past.length > 0 && <Section title="Past" items={past} onEdit={edit} onDelete={(id) => delMut.mutate(id)} muted />}
        </div>
      )}
    </div>
  );
}

function Section({ title, items, onEdit, onDelete, muted }: { title: string; items: CalendarEvent[]; onEdit: (e: CalendarEvent) => void; onDelete: (id: string) => void; muted?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="grid gap-3">
        {items.map(ev => <EventCard key={ev.id} ev={ev} onEdit={onEdit} onDelete={onDelete} muted={muted} />)}
      </div>
    </div>
  );
}

function EventCard({ ev, onEdit, onDelete, muted }: { ev: CalendarEvent; onEdit: (e: CalendarEvent) => void; onDelete: (id: string) => void; muted?: boolean }) {
  const start = new Date(ev.starts_at);
  const end = ev.ends_at ? new Date(ev.ends_at) : null;
  const dateLabel = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = ev.all_day ? "All day" : `${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}${end ? ` – ${end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : ""}`;
  return (
    <div className={`group rounded-2xl border border-border bg-card p-4 shadow-soft flex items-center gap-4 ${muted ? "opacity-70" : ""}`}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-soft text-primary shrink-0">
        <div className="text-center leading-tight">
          <div className="text-[10px] font-bold uppercase">{start.toLocaleString(undefined, { month: "short" })}</div>
          <div className="text-lg font-black -mt-0.5">{start.getDate()}</div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-bold truncate">{ev.title}</div>
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{ev.category}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {dateLabel} · {timeLabel}</span>
          {ev.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {ev.location}</span>}
        </div>
        {ev.description && <div className="mt-1.5 text-sm text-foreground/80 line-clamp-2">{ev.description}</div>}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={() => onEdit(ev)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-secondary" title="Edit"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => { if (confirm("Delete this event?")) onDelete(ev.id); }} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
