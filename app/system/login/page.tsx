import SystemGoogleLogin from "../system-google-login"

export default function SystemLoginPage() {
  return (
    <main className="min-h-screen bg-[#ffecdd] text-slate-900">
      <div className="container mx-auto px-4 py-16">
        <SystemGoogleLogin />
      </div>
    </main>
  )
}
