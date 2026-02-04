class SentimentService:
    MOODS = {
        'default': 'Stable & Neutral',
        'happy': 'Warm & Joyful',
        'sad': 'Somber & Reflective',
        'angry': 'Frustrated & Intense',
        'nostalgic': 'Deeply Nostalgic',
        'curious': 'Intrigued & Inquisitive',
        'protective': 'Protective & Caring',
        'distant': 'Reserved & Distant'
    }

    @classmethod
    def analyze_mood(cls, history, user_message):
        """
        Analyzes the last few messages to determine a 'Neural Pulse' (Mood).
        For now, uses simple keyword detection + history length.
        """
        # In a high-end implementation, this would be an AI call.
        # Let's use simple logic for speed.
        
        last_messages = [m.get('content', '').lower() for m in history[-3:]]
        all_text = " ".join(last_messages) + " " + user_message.lower()
        
        # Keyword triggers
        triggers = {
            'happy': ['joy', 'happy', 'great', 'love', 'smile', 'excited', 'good news'],
            'sad': ['miss', 'sorry', 'sad', 'pain', 'lonely', 'lost', 'tears', 'upset'],
            'angry': ['hate', 'stop', 'why', 'annoyed', 'mad', 'angry', 'never'],
            'nostalgic': ['remember', 'old times', 'back then', 'past', 'memory', 'childhood'],
            'protective': ['safe', 'care', 'protect', 'help', 'worry', 'don\'t worry'],
            'curious': ['how', 'what if', 'tell me', 'wondering', 'why did', 'curious']
        }
        
        detected_mood = 'default'
        max_hits = 0
        
        for mood, words in triggers.items():
            hits = sum(1 for word in words if word in all_text)
            if hits > max_hits:
                max_hits = hits
                detected_mood = mood
        
        # If very few messages, stay neutral
        if len(history) < 2 and max_hits < 2:
            detected_mood = 'default'
            
        return {
            'code': detected_mood,
            'label': cls.MOODS[detected_mood]
        }
