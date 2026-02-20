import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        const body = await request.json();
        const { flow_id } = body;

        if (!flow_id) {
            return NextResponse.json(
                { error: 'flow_id is required' },
                { status: 400 }
            );
        }

        const sessionId = uuidv4();
        const messageId = uuidv4();
        const timestamp = new Date().toISOString();

        const response = {
            success: true,
            session_id: sessionId,
            messages: [
                {
                    message_id: messageId,
                    sender: "bot",
                    message_type: "text",
                    message_text: "Welcome! What's your name?",
                    timestamp: timestamp
                }
            ],
            conversation_status: "active",
            current_node_id: "node_ask_name"
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error processing start preview request:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

