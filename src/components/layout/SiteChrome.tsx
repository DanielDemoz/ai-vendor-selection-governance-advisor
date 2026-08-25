import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          AI Vendor Advisor
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/assess" className="text-slate-600 hover:text-slate-900">
            Assessment
          </Link>
          <Link
            href="/assess"
            className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800"
          >
            Start
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-slate-500 sm:px-6">
        <p>Vendor-neutral AI selection and governance advisor for SMBs.</p>
        <p className="mt-2 text-xs">
          There is no universally best AI tool — only a better fit for your business, use case, and priorities.
        </p>
      </div>
    </footer>
  );
}
