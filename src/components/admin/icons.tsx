'use client';

type P = React.SVGProps<SVGSVGElement>;

export const AdmIcon = {
  dashboard: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" /><rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" /></svg>
  ),
  cases: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="10" rx="1" /><path d="M2 6h12M5 9h4" /></svg>
  ),
  profile: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="6" r="2.5" /><path d="M3 14a5 5 0 0 1 10 0" /></svg>
  ),
  analytics: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 14V2M2 14h12M5 11V8M8 11V6M11 11V4" /></svg>
  ),
  settings: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" /></svg>
  ),
  logout: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 4V2H2v12h7v-2M6 8h9M12 5l3 3-3 3" /></svg>
  ),
  help: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6" /><path d="M6.5 6a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5M8 11.5v.1" /></svg>
  ),
  edit: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M11 2l3 3-8 8H3v-3z" /></svg>
  ),
  trash: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 4h10M6 4V2h4v2M5 4l1 10h4l1-10" /></svg>
  ),
  plus: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 3v10M3 8h10" /></svg>
  ),
  external: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 12L12 4M6 4h6v6" /></svg>
  ),
  arrow: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
  ),
  eye: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></svg>
  ),
  upload: (p: P) => (
    <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 12h10M8 14V5M5 8l3-3 3 3" /></svg>
  ),
};
