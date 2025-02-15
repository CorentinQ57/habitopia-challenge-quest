import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WritingStyleManager } from "@/components/notes/WritingStyleManager";
import { DatePicker } from "@/components/ui/date-picker";

const Notes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Récupérer le style sélectionné
  const { data: writingStyle } = useQuery({
    queryKey: ["writing-style", selectedStyle],
    queryFn: async () => {
      if (!selectedStyle) return null;
      
      const { data, error } = await supabase
        .from("writing_styles")
        .select("prompt")
        .eq("id", selectedStyle)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedStyle,
  });

  // Récupérer la note pour la date sélectionnée
  const { data: note, isLoading } = useQuery({
    queryKey: ["note", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_notes")
        .select("*")
        .eq("date", format(selectedDate, "yyyy-MM-dd"))
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Mutation pour générer du contenu avec l'IA
  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const response = await fetch("https://haodastqykbgflafrlfn.supabase.co/functions/v1/generate-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          prompt,
          systemPrompt: writingStyle?.prompt 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la génération du contenu");
      }

      const data = await response.json();
      return data.content;
    },
    onSuccess: (generatedContent) => {
      setContent((prevContent) => {
        if (prevContent) {
          return prevContent + "\n\n" + generatedContent;
        }
        return generatedContent;
      });
      setAiPrompt("");
      toast({
        title: "Contenu généré",
        description: "Le contenu a été ajouté à votre note",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de générer le contenu. Veuillez vérifier que vous êtes connecté.",
        variant: "destructive",
      });
      console.error("Erreur lors de la génération:", error);
    },
  });

  // Mutation pour sauvegarder/mettre à jour une note
  const mutation = useMutation({
    mutationFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: existingNote } = await supabase
        .from("daily_notes")
        .select("id")
        .eq("date", dateStr)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingNote) {
        const { error } = await supabase
          .from("daily_notes")
          .update({ content })
          .eq("id", existingNote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_notes")
          .insert({
            date: dateStr,
            content,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", format(selectedDate, "yyyy-MM-dd")] });
      setIsEditing(false);
      toast({
        title: "Note sauvegardée",
        description: "Votre note a été enregistrée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la note.",
        variant: "destructive",
      });
      console.error("Erreur lors de la sauvegarde de la note:", error);
    },
  });

  const handleGenerateContent = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une demande pour l'IA",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditing(true);
    await generateMutation.mutateAsync(aiPrompt);
  };

  // Mettre à jour le contenu quand on change de date
  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
      setContent("");
    }
  }, [note]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Journal de bord</h1>
        <p className="text-muted-foreground">
          Prenez des notes quotidiennes et gardez une trace de vos pensées
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner une date</CardTitle>
            </CardHeader>
            <CardContent>
              <DatePicker
                date={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Assistant IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <WritingStyleManager
                selectedStyle={selectedStyle}
                onStyleChange={setSelectedStyle}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Exemple: Aide-moi à résumer ma journée..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateContent();
                    }
                  }}
                />
                <Button 
                  onClick={handleGenerateContent}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    "Générer"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Note du {format(selectedDate, "d MMMM yyyy", { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez votre note ici..."
                  className="min-h-[200px]"
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setContent(note?.content || "");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      "Sauvegarder"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {note?.content ? (
                  <div className="whitespace-pre-wrap">{note.content}</div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Aucune note pour cette date
                  </p>
                )}
                <Button
                  onClick={() => {
                    setIsEditing(true);
                    setContent(note?.content || "");
                  }}
                >
                  {note?.content ? "Modifier" : "Ajouter une note"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notes;
