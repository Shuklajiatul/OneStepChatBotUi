export function renderMessage(msg) {
    const { sender, message_type, message_text, message_data } = msg;

    switch (sender) {
        case 'user':
            return {
                align: 'left',
                bgColor: 'user',
                label: null,
                content: buildContent(message_type, message_text, message_data),
            };
        case 'bot':
            return {
                align: 'right',
                bgColor: 'bot',
                label: '🤖 Bot',
                content: buildContent(message_type, message_text, message_data),
            };
        case 'agent':
            return {
                align: 'right',
                bgColor: 'agent',
                label: '👨‍💼 Agent',
                content: buildContent(message_type, message_text, message_data),
            };
        default:
            return {
                align: 'left',
                bgColor: 'user',
                label: null,
                content: { kind: 'text', text: message_text || '' },
            };
    }
}

function buildContent(type, text, rawData) {
    const data = typeof rawData === 'string' ? JSON.parse(rawData || '{}') : rawData || {};

    if (type === 'text' || type === 'question') {
        return { kind: 'text', text };
    }
    if (type === 'interactive' && data.type === 'button') {
        return { kind: 'buttons', text, buttons: data.buttons };
    }
    if (type === 'interactive' && data.type === 'list') {
        return { kind: 'list', text, sections: data.sections };
    }
    if (type === 'image') {
        return { kind: 'image', url: text, caption: data.caption };
    }
    if (type === 'document') {
        return { kind: 'document', url: text, filename: data.filename };
    }
    return { kind: 'text', text };
}
