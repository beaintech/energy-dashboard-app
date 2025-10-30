export const API_BASE = import.meta.env.VITE_API_BASE as string;
export const WS_URL   = import.meta.env.VITE_WS_URL as string;

// 常用路径（按你现在结构保留最简约）:
export const EP = {
  snapshot: () => `${API_BASE}/snapshot`,
  devices:  (q: Record<string, string|number|undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(q).forEach(([k,v]) => v!=null && qs.set(k, String(v)));
    return `${API_BASE}/devices?${qs.toString()}`;
  },
  live:     (topics: string[], token?: string|null) =>
    `${WS_URL}/live?topics=${topics.join(',')}${token ? `&token=${token}` : ''}`
};
