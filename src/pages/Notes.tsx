
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

const Notes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Récupérer la note pour la date sélectionnée
  const { data: note, isLoading } = useQuery({
    queryKey: ["note", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_notes")
        .select("*")
        .eq("date", format(selectedDate, "yyyy-MM-dd"))
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    },
  });

  // Mutation pour sauvegarder/mettre à jour une note
  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("daily_notes")
        .upsert({
          date: format(selectedDate, "yyyy-MM-dd"),
          content,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
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

  // Mettre à jour le contenu quand on change de date
  useState(() => {
    if (note) {
      setContent(note.content);
    } else {
      setContent("");
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Journal de bord</h1>
        <p className="text-muted-foreground">
          Prenez des notes quotidiennes et gardez une trace de vos pensées
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendrier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={fr}
            />
          </CardContent>
        </Card>

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
