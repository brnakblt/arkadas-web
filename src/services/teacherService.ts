
import { Student } from './studentService';

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export interface Session {
    id: number;
    time: string;
    studentName: string;
    type: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export const teacherService = {
    async getMyStudents(): Promise<Student[]> {
        // For MVP, we fetch all students but could filter by teacherId in production
        const response = await fetch(`${STRAPI_URL}/api/students`, {
            headers: {
                // "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch teacher's students");
        }

        const json = await response.json();
        return json.data || [];
    },

    async getTodaySessions(): Promise<Session[]> {
        const today = new Date().toISOString().split('T')[0];
        try {
            const response = await fetch(`${STRAPI_URL}/api/attendance-logs?filters[date][$eq]=${today}&populate=student`, {
                headers: {
                    // "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch sessions");
            
            const json = await response.json();
            const records = json.data || [];

            if (records.length === 0) {
                // Fallback to mock if no real records exist yet for today to avoid empty UI during demo
                return this.getMockSessions();
            }

            return records.map((rec: any) => ({
                id: rec.id,
                time: new Date(rec.checkInTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                studentName: rec.student?.fullName || "İsimsiz Öğrenci",
                type: "Eğitim Seansı",
                status: rec.checkOutTime ? 'completed' : 'ongoing'
            }));
        } catch (error) {
            console.error("Session Fetch Error:", error);
            return this.getMockSessions();
        }
    },

    getMockSessions(): Session[] {
        const now = new Date();
        const baseHour = now.getHours();
        return [
            { id: 1, time: `${baseHour}:00`, studentName: "Ali Yılmaz", type: "Bireysel Eğitim", status: 'ongoing' },
            { id: 2, time: `${baseHour + 1}:00`, studentName: "Ayşe Demir", type: "Grup Eğitimi", status: 'upcoming' },
            { id: 3, time: `${baseHour + 2}:00`, studentName: "Mehmet Kaya", type: "Fizyoterapi", status: 'upcoming' },
            { id: 4, time: `${baseHour + 3}:00`, studentName: "Can Ak", type: "Bireysel Eğitim", status: 'upcoming' }
        ];
    }
};
