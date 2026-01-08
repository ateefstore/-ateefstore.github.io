import { useMutation } from "@tanstack/react-query";
import { api, type InsertFeedback } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSubmitFeedback() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      // Validate with schema first
      const validated = api.feedback.create.input.parse(data);
      
      const res = await fetch(api.feedback.create.path, {
        method: api.feedback.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Failed to submit feedback");
      }
      
      return api.feedback.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Feedback Sent",
        description: "Thank you for helping us improve the browser!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
