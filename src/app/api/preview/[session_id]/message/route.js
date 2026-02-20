import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request, { params }) {
    try {
        const { session_id } = await params;
        const body = await request.json();
        const { message } = body;

        if (!session_id) {
            return NextResponse.json(
                { error: 'session_id is required' },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { error: 'message is required' },
                { status: 400 }
            );
        }

        const messageId = uuidv4();
        const timestamp = new Date().toISOString();

        const response = {
            success: true,
            messages: [
                {
                    message_id: messageId,
                    sender: "bot",
                    message_type: "text",
                    message_text: `Nice to meet you, ${message}! What's your email?`,
                    timestamp: timestamp
                }
            ],
            conversation_status: "active",
            current_node_id: "node_ask_email"
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error processing send message request:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

