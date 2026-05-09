
const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export interface Student {
    id: number;
    documentId: string;
    fullName: string;
    tcIdentity: string;
    birthDate: string;
    diagnosis: string;
    status: string;
    ramReportEndDate: string;
    parentName: string;
    parentPhone: string;
    avatarUrl: string;
}

export const studentService = {
    async getStudents(): Promise<Student[]> {
        const response = await fetch(`${STRAPI_URL}/api/students`, {
            headers: { }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const json = await response.json();
        return json.data || [];
    },

    async getStudentStats() {
        const students = await this.getStudents();
        return {
            total: students.length,
            active: students.filter(s => s.status === 'ACTIVE').length,
            critical: students.filter(s => s.status === 'SUSPENDED').length
        };
    },

    async createStudent(data: Partial<Student>): Promise<Student> {
        const response = await fetch(`${STRAPI_URL}/api/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        if (!response.ok) throw new Error("Öğrenci kaydı başarısız");
        const json = await response.json();
        return json.data;
    },

    async syncRamReport(studentId: string, ramData: any): Promise<any> {
        const ramResponse = await fetch(`${STRAPI_URL}/api/ram-reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    student: studentId,
                    reportId: `RAM-${ramData.tcIdentity}-${Date.now()}`,
                    endDate: ramData.endDate,
                    diagnosisDetails: ramData.diagnosis,
                    rawContent: ramData.category,
                    aiJson: ramData
                }
            })
        });

        if (!ramResponse.ok) throw new Error("RAM Raporu kaydedilemedi");
        const ramJson = await ramResponse.json();

        for (const target of ramData.targets) {
            await fetch(`${STRAPI_URL}/api/bep-targets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        student: studentId,
                        description: target,
                        isCompleted: false
                    }
                })
            });
        }

        return ramJson.data;
    },

    async syncFromMebbis(tckn: string): Promise<any> {
        const response = await fetch(`${STRAPI_URL}/api/ram-reports/mebbis-sync?tckn=${tckn}`);
        if (!response.ok) throw new Error("MEBBİS senkronizasyonu başarısız");
        return await response.json();
    }
};
