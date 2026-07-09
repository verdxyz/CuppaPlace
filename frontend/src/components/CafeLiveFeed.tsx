// frontend/src/components/CafeLiveFeed.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type LivePost = {
  id: number;
  cafe_id: number;
  user_id?: number | null;
  user_name?: string | null;
  text?: string | null;
  image_url?: string | null;
  created_at: string;
  expires_at: string;
  likes?: number;
  dislikes?: number;

  // ✅ untuk anti dobel optimistic
  client_id?: string | null;
};

type Props = {
  cafeId: number;
  user: { id: number; name: string } | null;
  title?: string;
  variant?: "row" | "panel";
};

function timeAgoId(date: Date) {
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s} detik`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam`;
  const d = Math.floor(h / 24);
  return `${d} hari`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function makeClientId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return (
    localStorage.getItem("cuppa_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    null
  );
}

function getApiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE ?? "").trim().replace(/\/+$/, "");
  const base = raw.endsWith("/api") ? raw.slice(0, -4) : raw;
  if (base) return base;
  if (isBrowser()) return "";
  return "http://localhost:4010";
}

function getSocketBase(): string | null {
  const s = (process.env.NEXT_PUBLIC_SOCKET_URL ?? "").trim().replace(/\/+$/, "");
  if (s) return s;
  const apiBase = getApiBase();
  if (!apiBase) return null; // same-origin
  return apiBase;
}

let _socket: Socket | null = null;
let _socketBase: string | null = null;

function getSocket(): Socket {
  const base = getSocketBase();

  if (_socket && _socketBase !== base) {
    try {
      _socket.disconnect();
    } catch {}
    _socket = null;
  }

  if (_socket) return _socket;

  const token = getAuthToken();
  _socketBase = base;

  _socket = io(base ?? undefined, {
    transports: ["polling", "websocket"],
    autoConnect: true,
    auth: token ? { token } : undefined,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 500,
    timeout: 20000,
    withCredentials: false,
  });

  return _socket;
}

function buildApiUrl(path: string) {
  const base = getApiBase();
  return `${base}${path}`;
}

async function fetchLiveFeedREST(cafeId: number): Promise<LivePost[]> {
  const url = buildApiUrl(`/api/cafes/${cafeId}/live`);
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("Gagal load live feed");
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? []) as LivePost[];
}

async function postLiveREST(
  cafeId: number,
  payload: { text?: string; image_url?: string | null; client_id?: string }
) {
  const url = buildApiUrl(`/api/cafes/${cafeId}/live`);
  const token = getAuthToken();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.message || "Gagal mengirim live post");
  }
  return (await res.json()) as LivePost;
}

async function reactLiveREST(postId: number, type: "like" | "dislike") {
  const url = buildApiUrl(`/api/live/${postId}/react`);
  const token = getAuthToken();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ type }),
  });

  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.message || "Gagal memberi reaksi");
  }
  return (await res.json()) as { likes: number; dislikes: number };
}

function normalizeNewPayload(p: unknown): LivePost | null {
  if (!p) return null;
  // dukung payload lama { cafe_id, data: post }
  if (
    typeof p === "object" &&
    p !== null &&
    "data" in p &&
    typeof (p as { data?: unknown }).data === "object"
  ) {
    return (p as { data: LivePost }).data;
  }
  if (typeof p === "object" && p !== null) {
    return p as LivePost;
  }
  return null;
}

export default function CafeLiveFeed({
  cafeId,
  user,
  title = "Live Comment",
  variant = "row",
}: Props) {
  const [posts, setPosts] = useState<LivePost[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  // ✅ cooldown FE biar gak spam klik
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  const cafeIdRef = useRef<number>(cafeId);
  useEffect(() => {
    cafeIdRef.current = cafeId;
  }, [cafeId]);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setPosts((prev) => prev.filter((p) => new Date(p.expires_at).getTime() > now));
    }, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!cafeId || Number.isNaN(cafeId)) return;

    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    type HistoryPayload =
      | LivePost[]
      | { cafe_id?: number; cafeId?: number; data?: LivePost[]; posts?: LivePost[] };

    const onHistory = (payload: HistoryPayload) => {
      const payloadObj = !Array.isArray(payload) ? payload : {};
      const targetCafe = Number(payloadObj.cafe_id ?? payloadObj.cafeId ?? cafeIdRef.current);
      if (targetCafe !== cafeIdRef.current) return;

      const list: LivePost[] =
        Array.isArray(payload)
          ? payload
          : Array.isArray(payloadObj.data)
            ? payloadObj.data
            : Array.isArray(payloadObj.posts)
              ? payloadObj.posts
              : [];

      if (!list.length) return;
      setPosts(list);
    };

    const onNew = (raw: unknown) => {
      const p = normalizeNewPayload(raw);
      if (!p) return;
      if (Number(p.cafe_id) !== cafeIdRef.current) return;

      const incomingClientId = p.client_id ? String(p.client_id) : null;

      setPosts((prev) => {
        // ✅ replace optimistic kalau client_id sama
        if (incomingClientId) {
          const idx = prev.findIndex((x) => x.client_id && String(x.client_id) === incomingClientId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = p;
            return copy;
          }
        }

        // ✅ anti duplikat by id
        if (prev.some((x) => x.id === p.id)) return prev;
        return [p, ...prev].slice(0, 60);
      });
    };

    type UpdatePayload = {
      post_id?: number;
      id?: number;
      postId?: number;
      likes?: number;
      dislikes?: number;
      patch?: {
        likes?: number;
        dislikes?: number;
      };
    };

    const onUpdate = (payload: UpdatePayload) => {
      // dukung payload lama {post_id, patch:{likes,dislikes}}
      const id = Number(payload?.post_id ?? payload?.id ?? payload?.postId);
      if (!id) return;

      const likes =
        typeof payload?.likes === "number"
          ? payload.likes
          : typeof payload?.patch?.likes === "number"
            ? payload.patch.likes
            : undefined;

      const dislikes =
        typeof payload?.dislikes === "number"
          ? payload.dislikes
          : typeof payload?.patch?.dislikes === "number"
            ? payload.patch.dislikes
            : undefined;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                likes: typeof likes === "number" ? likes : p.likes,
                dislikes: typeof dislikes === "number" ? dislikes : p.dislikes,
              }
            : p
        )
      );
    };

    const onDeleteMany = (payload: number[] | { ids: number[] }) => {
      const ids: number[] = Array.isArray(payload)
        ? payload.map(Number)
        : Array.isArray((payload as { ids: number[] })?.ids)
          ? (payload as { ids: number[] }).ids.map(Number)
          : [];

      if (!ids.length) return;
      setPosts((prev) => prev.filter((p) => !ids.includes(Number(p.id))));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("live:history", onHistory);
    socket.on("live:new", onNew);
    socket.on("live:update", onUpdate);
    socket.on("live:delete_many", onDeleteMany);

    try {
      socket.emit("live:join", { cafe_id: cafeId });
      socket.emit("live:history", { cafe_id: cafeId });
    } catch {}

    (async () => {
      try {
        setBootError(null);
        const list = await fetchLiveFeedREST(cafeId);
        setPosts((prev) => (prev.length ? prev : list));
      } catch (e: unknown) {
        const err = e as { message?: string };
        setBootError(err?.message || "Gagal load live comment");
      }
    })();

    return () => {
      try {
        socket.emit("live:leave", { cafe_id: cafeId });
      } catch {}

      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("live:history", onHistory);
      socket.off("live:new", onNew);
      socket.off("live:update", onUpdate);
      socket.off("live:delete_many", onDeleteMany);
    };
  }, [cafeId]);

  const activePosts = useMemo(() => {
    const now = Date.now();
    return posts
      .filter((p) => new Date(p.expires_at).getTime() > now)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);
  }, [posts]);

  const submit = async () => {
    if (!user) {
      alert("Silakan login untuk kirim live comment.");
      return;
    }

    const nowTs = Date.now();
    if (nowTs < cooldownUntil) {
      const sisa = Math.ceil((cooldownUntil - nowTs) / 1000);
      alert(`Tunggu ${sisa} detik ya...`);
      return;
    }

    const v = text.trim();
    if (!v) return;

    const socket = getSocket();
    const now = new Date();

    const tempId = -Date.now();
    const clientId = makeClientId();

    const optimistic: LivePost = {
      id: tempId,
      cafe_id: cafeId,
      user_id: user.id,
      user_name: user.name,
      text: v.slice(0, 120),
      image_url: null,
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
      likes: 0,
      dislikes: 0,
      client_id: clientId,
    };

    setPosts((prev) => [optimistic, ...prev].slice(0, 60));
    setText("");
    setSending(true);

    // ✅ set cooldown FE (3 detik)
    setCooldownUntil(Date.now() + 3000);

    try {
      const created: LivePost | null = await new Promise((resolve) => {
        let done = false;

        socket.emit(
          "live:post",
          { cafe_id: cafeId, text: v, image_url: null, client_id: clientId },
          (resp: { error?: string; data?: LivePost } | LivePost) => {
            done = true;
            if ((resp as { error?: string })?.error) return resolve(null);
            const p = (resp as { data?: LivePost })?.data ? ((resp as { data?: LivePost }).data as LivePost) : (resp as LivePost);
            resolve(p ?? null);
          }
        );

        setTimeout(() => {
          if (!done) resolve(null);
        }, 1500);
      });

      if (created && created.id) {
        setPosts((prev) => {
          // replace optimistic by client_id OR tempId
          const without = prev.filter((p) => p.id !== tempId);
          const idx = without.findIndex((p) => p.client_id && p.client_id === clientId);
          if (idx >= 0) {
            const copy = [...without];
            copy[idx] = created;
            return copy;
          }
          if (without.some((p) => p.id === created.id)) return without;
          return [created, ...without].slice(0, 60);
        });
      } else {
        // fallback REST
        const restCreated = await postLiveREST(cafeId, { text: v, image_url: null, client_id: clientId });
        setPosts((prev) => {
          const without = prev.filter((p) => p.id !== tempId);
          const idx = without.findIndex((p) => p.client_id && p.client_id === clientId);
          if (idx >= 0) {
            const copy = [...without];
            copy[idx] = restCreated;
            return copy;
          }
          if (without.some((p) => p.id === restCreated.id)) return without;
          return [restCreated, ...without].slice(0, 60);
        });
      }
    } catch (e: unknown) {
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      const err = e as { message?: string };
      alert(err?.message || "Gagal mengirim live comment");
    } finally {
      setSending(false);
    }
  };

  const reactPost = async (postId: number, type: "like" | "dislike") => {
    if (!user) {
      alert("Silakan login untuk memberi reaksi.");
      return;
    }
    if (postId < 0) return;

    const socket = getSocket();

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: (p.likes || 0) + (type === "like" ? 1 : 0),
              dislikes: (p.dislikes || 0) + (type === "dislike" ? 1 : 0),
            }
          : p
      )
    );

    try {
      const updated = await new Promise<{ likes: number; dislikes: number } | null>((resolve) => {
        let done = false;

        socket.emit("live:react", { post_id: postId, type }, (resp: { error?: string; data?: { likes: number; dislikes: number } } | { likes: number; dislikes: number }) => {
          done = true;
          if ("error" in resp && resp.error) return resolve(null);
          const data = "data" in resp ? resp.data : resp;
          if (data && "likes" in data && "dislikes" in data && typeof data.likes === "number" && typeof data.dislikes === "number") {
            return resolve({ likes: data.likes, dislikes: data.dislikes });
          }
          resolve(null);
        });

        setTimeout(() => {
          if (!done) resolve(null);
        }, 1500);
      });

      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updated } : p)));
      } else {
        const rest = await reactLiveREST(postId, type);
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...rest } : p)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const wrapClass =
    variant === "row"
      ? "border border-gray-200/80 rounded-2xl p-4 bg-white"
      : "border border-gray-200/80 rounded-2xl p-4 bg-white";

  return (
    <section className={wrapClass}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full border ${
              connected
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
          >
            {connected ? "Live" : "Offline"}
          </span>
        </div>

        {user ? (
          <div className="text-xs text-gray-500">
            Login sebagai <span className="font-semibold text-gray-700">{user.name}</span>
          </div>
        ) : (
          <div className="text-xs text-gray-500">Login untuk ikut komentar</div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis komentar singkat (auto hilang 5 menit)..."
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#271F01]"
        />
        <button
          onClick={submit}
          disabled={!user || sending || !text.trim()}
          className="bg-[#271F01] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? "..." : "Kirim"}
        </button>
      </div>

      {bootError ? (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
          {bootError}
        </div>
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-2">
        {activePosts.length === 0 ? (
          <div className="text-sm text-gray-500 py-6">
            Belum ada live comment. Jadilah yang pertama ya.
          </div>
        ) : (
          activePosts.map((p) => (
            <div
              key={p.id}
              className="min-w-[220px] max-w-[220px] border border-gray-200 rounded-2xl p-3 bg-white shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#f3eee5] flex items-center justify-center text-xs font-bold text-[#271F01]">
                  {(p.user_name?.charAt(0) || "U").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{p.user_name || "User"}</p>
                  <p className="text-[10px] text-gray-500">{timeAgoId(new Date(p.created_at))}</p>
                </div>
              </div>

              <p className="text-xs text-gray-700 mb-2 line-clamp-2">“{p.text || "—"}”</p>

              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f3eee5] border border-gray-100">
                {p.image_url ? (
                  <Image src={p.image_url} alt="Live" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    (Tanpa foto)
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-2 text-gray-600">
                <button
                  onClick={() => reactPost(p.id, "dislike")}
                  className="inline-flex items-center gap-1 text-[11px] hover:text-[#271F01]"
                  disabled={!user || p.id < 0}
                  title={!user ? "Login dulu" : ""}
                >
                  <ThumbsDown size={14} />
                  <span>{p.dislikes || 0}</span>
                </button>
                <button
                  onClick={() => reactPost(p.id, "like")}
                  className="inline-flex items-center gap-1 text-[11px] hover:text-[#271F01]"
                  disabled={!user || p.id < 0}
                  title={!user ? "Login dulu" : ""}
                >
                  <ThumbsUp size={14} />
                  <span>{p.likes || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
