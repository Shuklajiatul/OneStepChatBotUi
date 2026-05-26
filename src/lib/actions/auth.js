"use server";

import { cookies } from "next/headers";

const LOGIN_API = "http://10.10.15.194:3006/api/auth/login";

export async function login(formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const response = await fetch(LOGIN_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("Login API Response:", { status: response.status, data });

        if (!response.ok) {
            return { error: data.message || "Invalid credentials" };
        }

        const token = data.token || data.access_token || data.data?.token;

        if (!token) {
            if (data.status === "success" || response.status === 200) {
                const cookieStore = await cookies();
                cookieStore.set("auth_token", "dummy-session-token", {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });
                return { success: true };
            }
            return { error: "Login successful but no token received" };
        }

        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { error: "An error occurred during login. Please try again." };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    return { success: true };
}

export async function getSession() {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value;
}
