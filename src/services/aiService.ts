
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

export interface TemplateRequest {
    goal: string;
    theme: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface TemplateResponse {
    success: boolean;
    svg: string;
}

export const aiService = {
    async generateTemplate(data: TemplateRequest): Promise<TemplateResponse> {
        const response = await fetch(`${AI_URL}/api/v1/generate/template`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to generate AI template");
        }

        return await response.json();
    },

    async parseRamReport(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${AI_URL}/api/v1/generate/ram-report`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to parse RAM report");
        }

        return await response.json();
    }
};
