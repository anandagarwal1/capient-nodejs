exports.EventName = Object.freeze(
    {
        'TRANSLATION': 'translation',
        'FROM_AUDIENCE': 'from-audience',
        'FROM_PRESENTER': 'from-presenter',
        'MEETING_TRANSLATION': 'meeting-translation',
        'CLIENT_SUPPORT_MESSAGE': 'client-support-message',
        'SUPPORT_MESSAGE_REPLY': 'support-message-reply',
        'CHAT_SUPPORT_AVAILABLE_UPDATE': 'chat-support-available-update',
        'NDEV_TTS_AUDIENCE': 'ndev-tts-audience',
        'NDEV_TTS_MEETING': 'ndev-tts',
        'NDEV_TRANSCRIPTION': 'ndev-transcription',
        'VISITOR_OFFLINE': 'visitor-offline'
    }
)

exports.OnEvent = Object.freeze(
    {
        'CONNECTION': 'connection',
        'DISCONNECT': 'disconnect',
        'LANGUAGE_JOIN': 'language-room',
        'LANGUAGE_LEAVE': 'language-room-leave',
        'SOURCE_TEXT': 'source-text',
        'AUDIENCE_MSG': 'audience-message',
        'PRESENTER_MSG': 'presenter-message',
        'MEETING_CHAT': 'meeting-chat',
        'SUPPORT_MESSAGE': 'support-message',
        'CLIENT_SUPPORT_MESSAGE_REPLY': 'client-support-message-reply',
        'AVAILABLE_ADMIN_LIST': 'available-admin-list',
        'ENABLE_ALL_ADMIN':'enable-all-admin',
        'ACTIVE_ADMIN_LIST_TOGGLE': 'active-admin-list',
        'SUPPORT_CHAT_AVAILABLE': 'chat-support-available',
        'NDEV_STT_FROM_FILE': 'ndev-req-as-file',
        'NDEV_MEETING_STT': 'ndev-meeting-stt',
        'ACTIVE_VOICE_MODEL': 'active-voice-model',
        'MAIL_CONTENT': 'mail-content',
        'USER_PROFILE': 'user-profile',
        'UPDATE_USER_PROFILE': 'update-user-profile',
        'TTS': 'text-to-speech'
    }
);

exports.Permission = Object.freeze(
    {
        'can_Chat': {type: Boolean},
        'can_Voice': {type: Boolean},
    }
);

