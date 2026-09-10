import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0f12] px-4 text-[#f0f6fc]">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14171d] p-8 text-center shadow-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-[#e01e37]">SIGN-IN UNSUCCESSFUL</p>
        <h1 className="mt-3 text-2xl font-bold">This login link could not be used</h1>
        <p className="mt-3 text-sm leading-6 text-[#8b949e]">
          Login links can only be used once and may expire. Request a fresh link, then open it in the same browser.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#e01e37] px-5 text-sm font-bold text-white transition hover:bg-[#c0182f]"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  )
}
