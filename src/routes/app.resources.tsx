import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, ExternalLink, Library, Plus, Sparkles, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  Toolbar,
  SearchInput,
  FilterChips,
  PrimaryButton,
  GhostButton,
  Modal,
  TextField,
  SelectField,
  LoadingBlock,
  ErrorBlock,
} from "@/components/feature-kit";
import {
  listResources,
  createResource,
  updateResource,
  deleteResource,
  summarizeResource,
  type Resource,
} from "@/lib/resources.functions";

export const Route = createFileRoute("/app/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Coretex" },
      { name: "description", content: "Your personal library of books, PDFs, past questions and study links." },
      { property: "og:title", content: "Resources — Coretex" },
      { property: "og:description", content: "Your personal library of books, PDFs, past questions and study links." },
    ],
  }),
  component: Page,
});

const CATEGORIES = [
  { value: "link", label: "Link" },
  { value: "book", label: "Book" },
  { value: "pdf", label: "PDF" },
  { value: "past_questions", label: "Past questions" },
  { value: "formula_sheet", label: "Formula sheet" },
  { value: "slides", label: "Slides" },
  { value: "video", label: "Video" },
];

type Draft = { id?: string; title: string; description: string; url: string; subject: string; category: string };
const emptyDraft: Draft = { title: "", description: "", url: "", subject: "General", category: "link" };

function Page() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listResources);
  const create = useServerFn(createResource);
  const update = useServerFn(updateResource);
  const remove = useServerFn(deleteResource);
  const summarize = useServerFn(summarizeResource);

  const query = useQuery({ queryKey: ["resources"], queryFn: () => fetchAll() });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["resources"] });

  const saveMut = useMutation({
    mutationFn: (d: Draft) => {
      const payload = {
        title: d.title.trim(),
        description: d.description || null,
        url: d.url || null,
        subject: d.subject.trim() || "General",
        category: d.category,
        resource_type: d.category,
      };
      return d.id ? update({ data: { id: d.id, patch: payload } }) : create({ data: payload });
    },
    onSuccess: () => {
      setDraft(null);
      invalidate();
      toast.success("Resource saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patchMut = useMutation({
    mutationFn: (v: { id: string; patch: Record<string, unknown> }) => update({ data: v }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Resource removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const aiMut = useMutation({
    mutationFn: (id: string) => summarize({ data: { id } }),
    onSuccess: (r) => {
      setSummary(r.text);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items: Resource[] = query.data ?? [];
  const visible = items.filter((r) => {
    if (filter === "bookmarked" && !r.is_bookmarked) return false;
    if (filter !== "all" && filter !== "bookmarked" && r.category !== filter) return false;
    const n = q.toLowerCase().trim();
    if (!n) return true;
    return r.title.toLowerCase().includes(n) || (r.description ?? "").toLowerCase().includes(n) || r.subject.toLowerCase().includes(n);
  });

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Resources" subtitle="Books, PDFs, past questions and references — all in one library.">
        <PrimaryButton onClick={() => setDraft(emptyDraft)}>
          <Plus className="h-4 w-4" /> Add resource
        </PrimaryButton>
      </PageHeader>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search your library…" />
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[{ value: "all", label: "All" }, { value: "bookmarked", label: "Saved" }, ...CATEGORIES]}
        />
      </Toolbar>

      {query.isLoading ? (
        <LoadingBlock label="Loading your library…" />
      ) : query.isError ? (
        <ErrorBlock message="We couldn't load your resources." onRetry={() => query.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Library}
          title={items.length === 0 ? "No saved resources" : "Nothing matches that"}
          description={
            items.length === 0
              ? "Save your first link or file to build your personal library."
              : "Try another search term or category."
          }
          actionLabel={items.length === 0 ? "Add a resource" : undefined}
          onAction={items.length === 0 ? () => setDraft(emptyDraft) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((r) => (
            <article key={r.id} className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="rounded-full bg-gradient-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                    {CATEGORIES.find((c) => c.value === r.category)?.label ?? r.category}
                  </span>
                  <h3 className="mt-2 truncate font-bold">{r.title}</h3>
                  <p className="text-xs text-muted-foreground">{r.subject}</p>
                </div>
                <button
                  type="button"
                  title="Bookmark"
                  aria-pressed={r.is_bookmarked}
                  onClick={() => patchMut.mutate({ id: r.id, patch: { is_bookmarked: !r.is_bookmarked } })}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${
                    r.is_bookmarked ? "border-primary bg-gradient-soft text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                </button>
              </div>

              {r.description && <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{r.description}</p>}

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold transition hover:bg-secondary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                )}
                <GhostButton title="AI summary" disabled={aiMut.isPending} onClick={() => aiMut.mutate(r.id)}>
                  <Sparkles className="h-3.5 w-3.5" /> Summarize
                </GhostButton>
                {r.ai_summary && (
                  <GhostButton title="View saved summary" onClick={() => setSummary(r.ai_summary!)}>
                    View summary
                  </GhostButton>
                )}
                <GhostButton
                  title="Edit"
                  onClick={() =>
                    setDraft({
                      id: r.id,
                      title: r.title,
                      description: r.description ?? "",
                      url: r.url ?? "",
                      subject: r.subject,
                      category: r.category,
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                </GhostButton>
                <GhostButton title="Delete" onClick={() => confirm(`Remove "${r.title}"?`) && deleteMut.mutate(r.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </GhostButton>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit resource" : "Add resource"}>
        {draft && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.title.trim()) return toast.error("Give the resource a title");
              saveMut.mutate(draft);
            }}
          >
            <TextField label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. WAEC Physics 2023 past questions" />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} options={CATEGORIES} />
              <TextField label="Subject" value={draft.subject} onChange={(v) => setDraft({ ...draft, subject: v })} placeholder="Physics" />
            </div>
            <TextField label="Link (optional)" value={draft.url} onChange={(v) => setDraft({ ...draft, url: v })} placeholder="https://…" />
            <TextField label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} textarea rows={4} />
            <div className="flex justify-end gap-2">
              <GhostButton onClick={() => setDraft(null)}>Cancel</GhostButton>
              <PrimaryButton type="submit" loading={saveMut.isPending}>Save</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!summary} onClose={() => setSummary(null)} title="AI study briefing" wide>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</div>
      </Modal>
    </div>
  );
}
