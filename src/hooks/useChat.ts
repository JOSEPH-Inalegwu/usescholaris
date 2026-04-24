import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isFromUser: boolean;
}

export const useChat = (userId: string | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const chatRef = collection(db, 'chats', userId, 'messages');
    const q = query(chatRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
            isFromUser: data.senderId === userId,
          } as ChatMessage;
        });
        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error('Chat listener error:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const sendMessage = useCallback(async (text: string, senderName: string) => {
    if (!userId || !text.trim()) return;

    const chatRef = collection(db, 'chats', userId, 'messages');
    await addDoc(chatRef, {
      text: text.trim(),
      senderId: userId,
      senderName,
      timestamp: serverTimestamp(),
    });
  }, [userId]);

  return { messages, loading, error, sendMessage };
};