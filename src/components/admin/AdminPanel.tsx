"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ModelCategory } from "@/lib/db/types";
import type { AdminModel } from "@/lib/db/admin";

type Service = { id: string; name: string; slug: string; description: string | null };

const CATEGORIES: ModelCategory[] = ["VIP", "Editorial", "Comercial", "Pasarela"];

const ACCENTS = [
  "from-amber-700/90 to-stone-900",
  "from-emerald-800/90 to-stone-900",
  "from-sky-800/90 to-stone-900",
  "from-rose-900/90 to-stone-900",
  "from-violet-900/90 to-stone-900",
  "from-lime-900/90 to-stone-900",
  "from-orange-900/90 to-stone-900",
  "from-teal-900/90 to-stone-900",
];

type FormState = {
  id: string;
  name: string;
  label: string;
  category: ModelCategory;
  accent: string;
  active: boolean;
  sortOrder: number;
  serviceIds: string[];
};

const emptyForm = (): FormState => ({
  id: "",
  name: "",
  label: "Chilena",
  category: "VIP",
  accent: ACCENTS[0],
  active: true,
  sortOrder: 0,
  serviceIds: [],
});

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [models, setModels] = useState<AdminModel[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/admin/models");
    if (res.status === 401) {
      setAuthenticated(false);
      return;
    }
    const data = (await res.json()) as { models: AdminModel[]; services: Service[] };
    setModels(data.models);
    setServices(data.services);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d: { authenticated: boolean }) => {
        if (d.authenticated) loadData();
        else setAuthenticated(false);
      })
      .catch(() => setAuthenticated(false));
  }, [loadData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setLoginError(data.error ?? "Error al iniciar sesión");
      return;
    }
    setPassword("");
    await loadData();
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthenticated(false);
    setModels([]);
    setEditingId(null);
    setIsNew(false);
  }

  function startEdit(model: AdminModel) {
    setEditingId(model.id);
    setIsNew(false);
    setForm({
      id: model.id,
      name: model.name,
      label: model.label,
      category: model.category,
      accent: model.accent,
      active: model.active,
      sortOrder: model.sortOrder,
      serviceIds: [...model.serviceIds],
    });
    setMessage("");
  }

  function startNew() {
    setEditingId(null);
    setIsNew(true);
    setForm({ ...emptyForm(), sortOrder: models.length + 1 });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setIsNew(false);
    setForm(emptyForm());
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const url = isNew ? "/api/admin/models" : `/api/admin/models/${form.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    const data = (await res.json()) as { models?: AdminModel[]; error?: string };

    if (!res.ok) {
      setMessage(data.error ?? "Error al guardar");
      return;
    }

    if (data.models) setModels(data.models);
    setMessage(isNew ? "Modelo creada" : "Cambios guardados");
    setIsNew(false);
    setEditingId(form.id);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta modelo del catálogo?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/models/${id}`, { method: "DELETE" });
    setLoading(false);
    const data = (await res.json()) as { models?: AdminModel[]; error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Error al eliminar");
      return;
    }
    if (data.models) setModels(data.models);
    cancelEdit();
    setMessage("Modelo eliminada");
  }

  async function handleUpload(modelId: string, file: File) {
    setUploadingId(modelId);
    setMessage("");
    const formData = new FormData();
    formData.append("modelId", modelId);
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    setUploadingId(null);
    const data = (await res.json()) as { models?: AdminModel[]; error?: string };

    if (!res.ok) {
      setMessage(data.error ?? "Error al subir foto");
      return;
    }
    if (data.models) setModels(data.models);
    setMessage("Foto subida correctamente");
  }

  function toggleService(serviceId: string) {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  }

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-400">
        Cargando...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-8"
        >
          <h1 className="font-serif text-2xl text-amber-100">Admin</h1>
          <p className="mt-2 text-sm text-stone-500">Panel de gestión de modelos</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="mt-6 w-full rounded-lg border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-400"
            required
          />
          {loginError && <p className="mt-2 text-sm text-red-400">{loginError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-amber-400 py-3 text-sm font-semibold uppercase tracking-wider text-stone-950 hover:bg-amber-300 disabled:opacity-50"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const editingModel = editingId ? models.find((m) => m.id === editingId) : null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <header className="border-b border-stone-800 bg-stone-900/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="font-serif text-xl text-amber-100">Panel Admin</h1>
            <p className="text-xs text-stone-500">Gestionar modelos, fotos y servicios</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className="text-sm text-stone-400 hover:text-amber-200">
              Ver sitio
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-stone-400 hover:text-red-300"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px]">
        {/* Lista de modelos */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-stone-100">
              Modelos ({models.length})
            </h2>
            <button
              type="button"
              onClick={startNew}
              className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-950 hover:bg-amber-300"
            >
              + Nueva
            </button>
          </div>

          {message && (
            <p className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
              {message}
            </p>
          )}

          <div className="space-y-2">
            {models.map((model) => (
              <div
                key={model.id}
                className={`flex items-center gap-4 rounded-xl border p-3 transition ${
                  editingId === model.id
                    ? "border-amber-400/50 bg-stone-900"
                    : "border-stone-800 bg-stone-900/50 hover:border-stone-700"
                }`}
              >
                <div
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${model.accent}`}
                >
                  {model.imageUrl ? (
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-serif text-lg text-white/30">
                      {model.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-100">{model.name}</p>
                  <p className="text-xs text-stone-500">
                    {model.category} · {model.active ? "Activa" : "Inactiva"} · #{model.sortOrder}
                  </p>
                </div>
                <label className="cursor-pointer text-xs text-amber-300 hover:text-amber-200">
                  {uploadingId === model.id ? "Subiendo..." : "Foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingId === model.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(model.id, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => startEdit(model)}
                  className="text-xs text-stone-400 hover:text-stone-200"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Formulario */}
        <section className="lg:sticky lg:top-6 lg:self-start">
          {(isNew || editingId) ? (
            <form
              onSubmit={handleSave}
              className="rounded-2xl border border-stone-800 bg-stone-900 p-5"
            >
              <h2 className="font-serif text-lg text-amber-100">
                {isNew ? "Nueva modelo" : `Editar: ${editingModel?.name}`}
              </h2>

              {isNew && (
                <div className="mt-4">
                  <label className="text-xs uppercase tracking-wider text-stone-500">ID (slug)</label>
                  <input
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="auto desde nombre si vacío"
                    className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs uppercase tracking-wider text-stone-500">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-3">
                <label className="text-xs uppercase tracking-wider text-stone-500">Etiqueta</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as ModelCategory })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500">Orden</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs uppercase tracking-wider text-stone-500">Color (gradiente)</label>
                <select
                  value={form.accent}
                  onChange={(e) => setForm({ ...form, accent: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm"
                >
                  {ACCENTS.map((a) => (
                    <option key={a} value={a}>
                      {a.replace("from-", "").replace("/90 to-stone-900", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-stone-500">Servicios</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <label
                      key={s.id}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs ${
                        form.serviceIds.includes(s.id)
                          ? "bg-amber-400 text-stone-950"
                          : "border border-stone-700 text-stone-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.serviceIds.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                        className="sr-only"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Visible en catálogo
              </label>

              <div className="mt-5 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-amber-400 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-950 hover:bg-amber-300 disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-stone-700 px-4 py-2.5 text-xs text-stone-400"
                >
                  Cancelar
                </button>
              </div>

              {!isNew && editingId && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingId)}
                  className="mt-3 w-full text-xs text-red-400 hover:text-red-300"
                >
                  Eliminar modelo
                </button>
              )}
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-800 p-8 text-center text-sm text-stone-500">
              Selecciona una modelo para editar o crea una nueva.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
