import { cookies } from "next/headers";

const LOGIN_API = "http://10.10.15.194:3006/api/auth/login";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        console.log("Login attempt for:", email);

        if (!email || !password) {
            return Response.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const requestBody = JSON.stringify({ email, password });
        console.log("Sending to backend:", LOGIN_API);
        console.log("Request body:", requestBody);

        const response = await fetch(LOGIN_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        const responseText = await response.text();
        console.log("Backend response status:", response.status);
        console.log("Backend response body:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { message: responseText };
        }

        if (!response.ok) {
            return Response.json(
                { error: data.message || "Invalid credentials", debug: data },
                { status: response.status }
            );
        }

        const token = data.token || data.access_token || data.data?.token;
        const cookieStore = await cookies();

        if (token) {
            cookieStore.set("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            });
        } else {
            cookieStore.set("auth_token", "session-active", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("Login error:", error);
        return Response.json(
            { error: "An error occurred during login. Please try again." },
            { status: 500 }
        );
    }
}
