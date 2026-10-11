import { IconDeviceFloppy, IconPlus, IconTrash } from "@tabler/icons-react";
import { Field, TextInput, TextArea, IconButton } from "../../components/Fields";

export default function BranchEditor({ draft, updateDraft, onSave, onDelete, loading, message, updateSubbranch, updateToken, addToken, removeToken, setDraft, nextClientId, slugify }) {
  return (
        <section className="rounded-lg bg-(--adech-surface) p-6 ring-1 ring-(--adech-border)">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-(--adech-title)">
                {draft.id ? "Edit branch" : "Create branch"}
              </h2>
              <p className="text-sm text-(--adech-paragraph)">
                Published branches are available in Themes.
              </p>
            </div>

            <div className="flex gap-2">
              {draft.id && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 rounded-lg border border-(--adech-border) px-4 py-2 text-sm font-semibold text-(--adech-title)"
                >
                  <IconTrash size={18} />
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-(--adech-hero-bg-button) px-4 py-2 text-sm font-semibold text-(--adech-hero-fg-button) disabled:opacity-60"
              >
                <IconDeviceFloppy size={18} />
                Save
              </button>
            </div>
          </div>

          {message && <p className="mt-4 text-sm text-(--adech-muted)">{message}</p>}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <TextInput
                value={draft.title}
                onChange={(event) =>
                  updateDraft({
                    title: event.target.value,
                    slug: draft.slug || slugify(event.target.value),
                  })
                }
              />
            </Field>

            <Field label="Slug">
              <TextInput
                value={draft.slug}
                onChange={(event) => updateDraft({ slug: slugify(event.target.value) })}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Description">
              <TextArea
                value={draft.description}
                onChange={(event) => updateDraft({ description: event.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(event) => updateDraft({ status: event.target.value })}
                className="w-full rounded-lg border border-(--adech-border) bg-(--adech-surface-muted) px-3 py-2 text-sm text-(--adech-fg) outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {draft.subbranches.map((subbranch, subIndex) => (
              <div
                key={subbranch._key}
                className="rounded-lg border border-(--adech-border) bg-(--adech-surface-muted) p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Subbranch">
                    <TextInput
                      value={subbranch.name}
                      onChange={(event) =>
                        updateSubbranch(subIndex, { name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Description">
                    <TextInput
                      value={subbranch.description}
                      onChange={(event) =>
                        updateSubbranch(subIndex, {
                          description: event.target.value,
                        })
                      }
                    />
                  </Field>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {subbranch.tokens.map((tokenItem, tokenIndex) => (
                    <div
                      key={tokenItem._key}
                      className="grid gap-3 md:grid-cols-[1fr_140px_44px_44px]"
                    >
                      <TextInput
                        value={tokenItem.name}
                        onChange={(event) =>
                          updateToken(subIndex, tokenIndex, {
                            name: event.target.value,
                          })
                        }
                        placeholder="adech-palette-1"
                      />
                      <TextInput
                        value={tokenItem.hex}
                        onChange={(event) =>
                          updateToken(subIndex, tokenIndex, {
                            hex: event.target.value,
                          })
                        }
                        placeholder="#FFFFFF"
                      />
                      <span
                        className="h-10 rounded-lg border border-(--adech-border)"
                        style={{ backgroundColor: tokenItem.hex }}
                      />
                      <IconButton
                        type="button"
                        onClick={() => removeToken(subIndex, tokenIndex)}
                        aria-label="Delete color token"
                        title="Delete color token"
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addToken(subIndex)}
                    className="inline-flex items-center gap-2 rounded-lg border border-(--adech-border) px-3 py-2 text-sm font-semibold text-(--adech-title)"
                  >
                    <IconPlus size={18} />
                    Create Color Token
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        subbranches: current.subbranches.filter(
                          (_, index) => index !== subIndex
                        ),
                      }))
                    }
                    className="rounded-lg border border-(--adech-border) px-3 py-2 text-sm font-semibold text-(--adech-title)"
                  >
                    Remove subbranch
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              updateDraft({
                subbranches: [
                  ...draft.subbranches,
                  { _key: nextClientId(), name: "palette", description: "", tokens: [] },
                ],
              })
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-(--adech-border) px-4 py-2 text-sm font-semibold text-(--adech-title)"
          >
            <IconPlus size={18} />
            Add subbranch
          </button>
        </section>
  );
}
