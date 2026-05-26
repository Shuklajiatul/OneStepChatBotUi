import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const { token } = await request.json();
        const cookieStore = await cookies();

        cookieStore.set("auth_token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error("Set token error:", error);
        return Response.json({ error: "Failed to set token" }, { status: 500 });
    }
}
