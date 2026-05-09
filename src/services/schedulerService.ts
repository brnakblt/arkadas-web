
const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export interface Classroom {
    id: number;
    documentId: string;
    name: string;
    type: 'INDIVIDUAL' | 'GROUP' | 'PHYSIOTHERAPY' | 'SENSORY_INTEGRATION';
    capacity: number;
}

export interface SessionPlan {
    id: number;
    documentId: string;
    startTime: string;
    endTime: string;
    student: any;
    teacher: any;
    classroom: any;
    module: any;
    status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    isGroup: boolean;
}

export const schedulerService = {
    async getClassrooms(): Promise<Classroom[]> {
        const response = await fetch(`${STRAPI_URL}/api/classrooms`);
        if (!response.ok) throw new Error("Failed to fetch classrooms");
        const json = await response.json();
        return json.data || [];
    },

    async getSessions(date: string): Promise<SessionPlan[]> {
        const response = await fetch(`${STRAPI_URL}/api/session-plans?populate=*`);
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const json = await response.json();
        return json.data || [];
    },

    async createSession(data: any): Promise<SessionPlan> {
        // Real-time conflict check could be added here or on backend lifecycles
        const response = await fetch(`${STRAPI_URL}/api/session-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Ders planlanamadı");
        }

        const json = await response.json();
        return json.data;
    },

    async validateSession(data: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];
        const sessions = await this.getSessions(data.startTime.split('T')[0]);

        // 1. Room Conflict
        const roomConflict = sessions.find(s => 
            s.classroom?.id === data.classroom && 
            this.isOverlapping(s.startTime, s.endTime, data.startTime, data.endTime)
        );
        if (roomConflict) errors.push("Derslik bu saatte dolu");

        // 2. Teacher Conflict
        const teacherConflict = sessions.find(s => 
            s.teacher?.id === data.teacher && 
            this.isOverlapping(s.startTime, s.endTime, data.startTime, data.endTime)
        );
        if (teacherConflict) errors.push("Öğretmenin bu saatte başka bir dersi var");

        // 3. Teacher Daily Limit (8h)
        const teacherDailyTotal = sessions.filter(s => s.teacher?.id === data.teacher).length;
        if (teacherDailyTotal >= 8) errors.push("Öğretmen günlük 8 saat limitini doldurdu");

        // 4. Student Daily Limit (2 Indiv + 1 Group)
        const studentSessions = sessions.filter(s => s.student?.id === data.student);
        const indCount = studentSessions.filter(s => !s.isGroup).length;
        const grpCount = studentSessions.filter(s => s.isGroup).length;

        if (data.isGroup && grpCount >= 1) errors.push("Öğrenci günlük grup dersi limitini doldurdu");
        if (!data.isGroup && indCount >= 2) errors.push("Öğrenci günlük bireysel ders limitini doldurdu");

        return {
            valid: errors.length === 0,
            errors
        };
    },

    isOverlapping(s1: string, e1: string, s2: string, e2: string): boolean {
        return new Date(s1) < new Date(e2) && new Date(s2) < new Date(e1);
    },

    async exportSessions(date: string): Promise<void> {
        window.open(`${STRAPI_URL}/api/session-plans/export?date=${date}`, '_blank');
    },

    async checkModuleLimit(studentId: number, moduleId: number, date: string): Promise<boolean> {
        const response = await fetch(`${STRAPI_URL}/api/session-plans?filters[student][id]=${studentId}&filters[module][id]=${moduleId}&filters[status][$ne]=CANCELLED&populate=module`);
        if (!response.ok) return true;
        
        const json = await response.json();
        const sessions = json.data || [];
        
        const targetDate = new Date(date);
        const monthlyCount = sessions.filter((s: any) => {
            const d = new Date(s.startTime);
            return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
        }).length;

        const moduleResponse = await fetch(`${STRAPI_URL}/api/educational-modules/${moduleId}`);
        if (!moduleResponse.ok) return true;
        const moduleJson = await moduleResponse.json();
        const limit = moduleJson.data?.totalMonthlyHours || 8;

        return monthlyCount < limit;
    }
};
