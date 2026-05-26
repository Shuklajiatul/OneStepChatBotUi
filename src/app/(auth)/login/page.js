import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
    title: "Login | Chatbot Portal",
    description: "Login to your chatbot management portal",
};

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 antialiased">
            {/* Background Orbs */}
            <div className="absolute left-1/4 top-1/4 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-[128px]" />
            <div className="absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[128px]" />

            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

            <main className="z-10 flex w-full flex-col items-center justify-center px-4">
                <div className="relative group">
                    {/* Glowing border effect */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/50 to-blue-500/50 opacity-20 blur-xl transition duration-1000 group-hover:opacity-40" />

                    <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
                        <LoginForm />
                    </div>
                </div>
            </main>

            {/* Decorative dots grid */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
    );
}
